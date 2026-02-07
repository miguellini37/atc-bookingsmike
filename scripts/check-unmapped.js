const airports = require('../frontend/public/data/airports.json');
const firs = require('../frontend/public/data/firs.json');
const http = require('http');

const AIRPORT_SUFFIXES = new Set(['DEL', 'GND', 'TWR', 'APP', 'DEP']);
const FIR_SUFFIXES = new Set(['CTR', 'FSS']);

function resolveCallsign(callsign) {
  const parts = callsign.split('_');
  const suffix = parts[parts.length - 1]?.toUpperCase();
  const prefixParts = parts.slice(0, -1);

  if (AIRPORT_SUFFIXES.has(suffix)) {
    for (let i = prefixParts.length; i >= 1; i--) {
      const icao = prefixParts.slice(0, i).join('_').toUpperCase();
      if (airports[icao]) return { type: 'airport', name: airports[icao].name, icao };
      if (icao.length === 3) {
        const kIcao = 'K' + icao;
        if (airports[kIcao]) return { type: 'airport', name: airports[kIcao].name, icao: kIcao };
      }
    }
    return null;
  }

  if (FIR_SUFFIXES.has(suffix)) {
    for (let i = prefixParts.length; i >= 1; i--) {
      const prefix = prefixParts.slice(0, i).join('_').toUpperCase();
      if (firs[prefix]) return { type: 'fir', name: firs[prefix].name, prefix };
    }
    return null;
  }

  return null;
}

http.get('http://localhost:3000/api/bookings', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const bookings = json.data || [];
    console.log('Total bookings:', bookings.length);

    const unmapped = [];
    const mapped = [];
    for (const b of bookings) {
      const result = resolveCallsign(b.callsign);
      if (!result) {
        unmapped.push(b.callsign);
      } else {
        mapped.push(b.callsign + ' -> ' + result.type + ': ' + result.name);
      }
    }

    console.log('\nMapped (' + mapped.length + '):');
    mapped.forEach(m => console.log('  ' + m));

    console.log('\nUnmapped (' + unmapped.length + '):');
    unmapped.forEach(cs => {
      const parts = cs.split('_');
      const suffix = parts[parts.length - 1]?.toUpperCase();
      const prefixParts = parts.slice(0, -1);
      console.log('  ' + cs + '  (suffix: ' + suffix + ')');
      for (let i = prefixParts.length; i >= 1; i--) {
        const prefix = prefixParts.slice(0, i).join('_').toUpperCase();
        const inAirports = !!airports[prefix];
        const inFirs = !!firs[prefix];
        console.log('    tried: ' + prefix + (inAirports ? ' [FOUND airports]' : inFirs ? ' [FOUND firs]' : ' [NOT FOUND]'));
        if (prefix.length === 3) {
          const kIcao = 'K' + prefix;
          console.log('    tried: ' + kIcao + (airports[kIcao] ? ' [FOUND airports]' : ' [NOT FOUND]'));
        }
      }
    });
  });
}).on('error', (e) => {
  console.error('Could not connect to API at localhost:3000:', e.message);
  console.error('Make sure the backend is running.');
});
