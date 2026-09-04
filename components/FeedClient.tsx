"use client";

import { useEffect, useMemo, useState } from "react";
import PostCard from "@/components/PostCard";
import { geocodePLZ } from "@/lib/geocode";
import { distanceKm } from "@/lib/distance";
import { CATEGORIES, Post } from "@/lib/types";

const STORAGE_KEY = "umdieecke:meine-plz";
const RADIUS_OPTIONS = [5, 10, 25, 50] as const;

export default function FeedClient({ posts }: { posts: Post[] }) {
  const [category, setCategory] = useState<string>("Alle");
  const [plzInput, setPlzInput] = useState("");
  const [myLocation, setMyLocation] = useState<{
    lat: number;
    lng: number;
    placeName: string;
  } | null>(null);
  const [radius, setRadius] = useState<number>(25);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setPlzInput(saved);
      geocodePLZ(saved).then((geo) => {
        if (geo) setMyLocation(geo);
      });
    }
  }, []);

  async function handleFindNearby(e: React.FormEvent) {
    e.preventDefault();
    setGeoLoading(true);
    setGeoError(null);
    const geo = await geocodePLZ(plzInput);
    setGeoLoading(false);
    if (!geo) {
      setGeoError("Postleitzahl nicht gefunden. Bitte prüfen.");
      setMyLocation(null);
      return;
    }
    setMyLocation(geo);
    localStorage.setItem(STORAGE_KEY, plzInput.trim());
  }

  function clearNearby() {
    setMyLocation(null);
    setPlzInput("");
    setGeoError(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  const postsWithDistance = useMemo(() => {
    return posts.map((post) => {
      const dist =
        myLocation && post.lat != null && post.lng != null
          ? distanceKm(myLocation.lat, myLocation.lng, post.lat, post.lng)
          : null;
      return { post, distance: dist };
    });
  }, [posts, myLocation]);

  const filtered = useMemo(() => {
    let list = postsWithDistance.filter(
      ({ post }) => category === "Alle" || post.category === category,
    );

    if (myLocation) {
      list = list.filter(
        ({ distance }) => distance === null || distance <= radius,
      );
      list = [...list].sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    return list;
  }, [postsWithDistance, category, myLocation, radius]);

  return (
    <>
      <section className="rounded-lg border border-black/10 dark:border-white/10 p-4 mb-6">
        <form onSubmit={handleFindNearby} className="flex flex-wrap gap-2 items-end">
          <label className="text-sm font-medium">
            Meine PLZ
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{5}"
              maxLength={5}
              placeholder="z.B. 10115"
              value={plzInput}
              onChange={(e) => setPlzInput(e.target.value)}
              className="mt-1 block border border-black/15 dark:border-white/15 rounded-md px-3 py-2 text-sm bg-transparent w-32"
            />
          </label>

          {myLocation && (
            <label className="text-sm font-medium">
              Umkreis
              <select
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="mt-1 block border border-black/15 dark:border-white/15 rounded-md px-3 py-2 text-sm bg-transparent"
              >
                {RADIUS_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r} km
                  </option>
                ))}
              </select>
            </label>
          )}

          <button
            type="submit"
            disabled={geoLoading}
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {geoLoading ? "..." : "In meiner Nähe suchen"}
          </button>

          {myLocation && (
            <button
              type="button"
              onClick={clearNearby}
              className="text-sm text-black/50 dark:text-white/50 underline px-2 py-2"
            >
              Zurücksetzen
            </button>
          )}
        </form>
        {geoError && <p className="text-sm text-red-600 mt-2">{geoError}</p>}
        {myLocation && (
          <p className="text-sm text-black/60 dark:text-white/60 mt-2">
            Zeige Beiträge im Umkreis von {radius} km um {myLocation.placeName}{" "}
            ({plzInput}).
          </p>
        )}
      </section>

      <section className="flex flex-wrap gap-3 mb-6">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-black/15 dark:border-white/15 rounded-md px-3 py-2 text-sm bg-transparent"
        >
          <option value="Alle">Alle Kategorien</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </section>

      {filtered.length === 0 ? (
        <p className="text-black/60 dark:text-white/60">
          Keine Beiträge gefunden. Versuch einen anderen Filter oder größeren
          Umkreis.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map(({ post, distance }) => (
            <PostCard key={post.id} post={post} distanceKm={distance} />
          ))}
        </div>
      )}
    </>
  );
}
