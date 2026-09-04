// Preview-Sandbox hat kein /opt/homebrew/bin im PATH, aber Turbopack startet
// intern zusätzliche node-Prozesse per PATH-Lookup (nicht process.execPath).
// Deshalb PATH hier vor dem Start von Next.js ergänzen.
process.env.PATH = `/opt/homebrew/bin:${process.env.PATH || ""}`;
process.argv = [process.argv[0], process.argv[1], "dev", "--webpack"];
require("/Users/makowski/Desktop/Project 1/node_modules/next/dist/bin/next");
