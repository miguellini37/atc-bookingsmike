#!/usr/bin/env node
/**
 * Parse VATSpy data files into static JSON for the map view.
 *
 * Source:  twatswimrepoatc-bookingsmikevatspy-data/VATSpy.dat
 *          twatswimrepoatc-bookingsmikevatspy-data/Boundaries.geojson
 *
 * Output:  frontend/public/data/airports.json   (ICAO -> name, lat, lon, fir)
 *          frontend/public/data/firs.json        (callsign prefix -> icao, name, boundaryId)
 *          frontend/public/data/boundaries.geojson (copy)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VATSPY_PATH = path.join(ROOT, 'twatswimrepoatc-bookingsmikevatspy-data', 'VATSpy.dat');
const BOUNDARIES_SRC = path.join(ROOT, 'twatswimrepoatc-bookingsmikevatspy-data', 'Boundaries.geojson');
const OUT_DIR = path.join(ROOT, 'frontend', 'public', 'data');

// Ensure output directory exists
fs.mkdirSync(OUT_DIR, { recursive: true });

// Read VATSpy.dat
const raw = fs.readFileSync(VATSPY_PATH, 'utf-8');
const lines = raw.split(/\r?\n/);

// Find section boundaries
let currentSection = null;
const sections = { Countries: [], Airports: [], FIRs: [], UIRs: [], IDL: [] };

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith(';')) continue;

  const sectionMatch = trimmed.match(/^\[(\w+)\]$/);
  if (sectionMatch) {
    currentSection = sectionMatch[1];
    continue;
  }

  if (currentSection && sections[currentSection]) {
    sections[currentSection].push(trimmed);
  }
}

// --- Parse Airports ---
// Format: ICAO|Airport Name|Latitude|Longitude|IATA/LID|FIR|IsPseudo
const airports = {};
for (const line of sections.Airports) {
  const parts = line.split('|');
  if (parts.length < 7) continue;
  const [icao, name, lat, lon, , fir, isPseudo] = parts;
  if (isPseudo === '1') continue; // Skip pseudo airports
  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);
  if (isNaN(latNum) || isNaN(lonNum)) continue;
  airports[icao] = { name, lat: latNum, lon: lonNum, fir };
}

console.log(`Parsed ${Object.keys(airports).length} airports`);

// --- Parse FIRs ---
// Format: ICAO|NAME|CALLSIGN PREFIX|FIR BOUNDARY
// A FIR can have multiple callsign prefixes (multiple lines with same ICAO)
// We want: callsign prefix -> { icao, name, boundaryId }
// If callsign prefix is empty, use ICAO as default prefix
const firs = {};
for (const line of sections.FIRs) {
  const parts = line.split('|');
  if (parts.length < 4) continue;
  const [icao, name, callsignPrefix, boundaryId] = parts;

  const entry = {
    icao,
    name,
    boundaryId: boundaryId || icao,
  };

  // Index by callsign prefix (e.g., EDM -> CZEG)
  const prefix = callsignPrefix || icao;
  firs[prefix] = entry;

  // Also index by FIR ICAO itself so CZVR_CTR resolves even if
  // VATSpy only lists specific prefixes like VAN/ZVR for that FIR
  if (callsignPrefix && !firs[icao]) {
    firs[icao] = entry;
  }
}

console.log(`Parsed ${Object.keys(firs).length} FIR entries`);

// --- Write outputs ---
fs.writeFileSync(
  path.join(OUT_DIR, 'airports.json'),
  JSON.stringify(airports, null, 0) // Compact for production
);
console.log(`Written airports.json (${(fs.statSync(path.join(OUT_DIR, 'airports.json')).size / 1024).toFixed(1)} KB)`);

fs.writeFileSync(
  path.join(OUT_DIR, 'firs.json'),
  JSON.stringify(firs, null, 0)
);
console.log(`Written firs.json (${(fs.statSync(path.join(OUT_DIR, 'firs.json')).size / 1024).toFixed(1)} KB)`);

// Copy Boundaries.geojson
fs.copyFileSync(BOUNDARIES_SRC, path.join(OUT_DIR, 'boundaries.geojson'));
const boundSize = (fs.statSync(path.join(OUT_DIR, 'boundaries.geojson')).size / (1024 * 1024)).toFixed(1);
console.log(`Copied boundaries.geojson (${boundSize} MB)`);

console.log('Done!');
