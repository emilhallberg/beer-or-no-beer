const fs = require('fs');
const path = require('path');

const beer = JSON.parse(fs.readFileSync(path.join(__dirname, '../resources/Beer.json'), 'utf8'));
const sb = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/assets/Systembolagetnew.json'), 'utf8'));

const TODAY = '2026-03-14T00:00:00';

// Build Systembolaget lookup maps
const sbByFull = new Map();
const sbByBold = new Map();
sb.forEach(b => {
  const full = b.productNameThin
    ? (b.productNameBold + ' ' + b.productNameThin)
    : b.productNameBold;
  sbByFull.set(full.toLowerCase().trim(), b);
  if (!sbByBold.has(b.productNameBold.toLowerCase().trim())) {
    sbByBold.set(b.productNameBold.toLowerCase().trim(), b);
  }
});

function findSbMatch(name) {
  const n = name.toLowerCase().trim();
  return sbByFull.get(n) || sbByBold.get(n) || null;
}

// Deterministic pseudo-random from beer name (so same beer always gets same ABV)
function seededRandom(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) / 2147483647;
}

function inferType(name) {
  const n = name.toLowerCase();
  if (n.includes('neipa')) return 'New England IPA';
  if (n.includes('new england ipa')) return 'New England IPA';
  if (n.includes('hazy ipa') || n.includes('hazy india')) return 'New England IPA';
  if (n.includes('double ipa') || n.includes('dipa') || n.includes('imperial ipa')) return 'Double IPA';
  if (n.includes('ipa') || n.includes('india pale ale')) return 'India Pale Ale';
  if (n.includes('imperial stout') || n.includes('russian imperial')) return 'Imperial Stout';
  if (n.includes('stout')) return 'Stout';
  if (n.includes('porter')) return 'Porter';
  if (n.includes('pilsner') || n.includes('pilsener') || n.endsWith(' pils') || n.includes(' pils ')) return 'Pilsner';
  if (n.includes('weiss') || n.includes('weizen') || n.includes('wheat')) return 'Wheat Beer';
  if (n.includes('pale ale')) return 'Pale Ale';
  if (n.includes('gose')) return 'Gose';
  if (n.includes('berliner weisse')) return 'Berliner Weisse';
  if (n.includes('sour')) return 'Sour';
  if (n.includes('saison') || n.includes('farmhouse')) return 'Saison';
  if (n.includes('tripel') || n.includes('triple')) return 'Tripel';
  if (n.includes('dubbel')) return 'Dubbel';
  if (n.includes('amber')) return 'Amber Ale';
  if (n.includes('brown ale')) return 'Brown Ale';
  if (n.includes('red ale') || n.includes('red ipa')) return 'Red Ale';
  if (n.includes('blonde') || n.includes('blond')) return 'Blonde Ale';
  if (n.includes('lager')) return 'Lager';
  if (n.includes('export')) return 'Lager';
  if (n.includes('bock') || n.includes('märzen') || n.includes('marzen')) return 'Bock';
  if (n.includes('barleywine') || n.includes('barley wine')) return 'Barleywine';
  if (n.includes('cider')) return 'Cider';
  return 'Lager';
}

const ABV_RANGES = {
  'New England IPA':  [6.0, 8.0],
  'Double IPA':       [7.5, 10.0],
  'India Pale Ale':   [5.5, 7.5],
  'Imperial Stout':   [8.0, 13.0],
  'Stout':            [4.5, 8.5],
  'Porter':           [4.5, 7.0],
  'Pilsner':          [4.5, 5.5],
  'Wheat Beer':       [4.5, 5.5],
  'Pale Ale':         [4.5, 6.0],
  'Gose':             [3.5, 5.0],
  'Berliner Weisse':  [3.0, 4.5],
  'Sour':             [3.5, 5.5],
  'Saison':           [5.0, 7.0],
  'Tripel':           [8.0, 10.5],
  'Dubbel':           [6.0, 8.5],
  'Amber Ale':        [4.5, 6.5],
  'Brown Ale':        [4.5, 6.5],
  'Red Ale':          [4.5, 6.5],
  'Blonde Ale':       [4.0, 5.5],
  'Lager':            [4.0, 5.5],
  'Bock':             [6.0, 8.0],
  'Barleywine':       [8.0, 12.0],
  'Cider':            [4.5, 7.0],
};

function inferAbv(name, type) {
  const r = seededRandom(name);
  const [min, max] = ABV_RANGES[type] || [4.0, 5.5];
  return Math.round((min + r * (max - min)) * 10) / 10;
}

let matchCount = 0;
let inferredCount = 0;

const updated = beer.map(b => {
  const match = b.Real ? findSbMatch(b.Name) : null;

  let abv, type, createdAt;

  if (match) {
    abv = match.alcoholPercentage;
    type = match.categoryLevel2;
    createdAt = match.productLaunchDate;
    matchCount++;
  } else {
    type = inferType(b.Name);
    abv = inferAbv(b.Name, type);
    createdAt = TODAY;
    inferredCount++;
  }

  return {
    ...b,
    createdAt,
    abv,
    type,
    meta: {},
  };
});

fs.writeFileSync(
  path.join(__dirname, '../resources/Beer.json'),
  JSON.stringify(updated, null, 2)
);

console.log(`Done! ${updated.length} beers updated.`);
console.log(`  Matched from Systembolaget: ${matchCount}`);
console.log(`  Type/ABV inferred: ${inferredCount}`);

// Stats on inferred types
const typeCounts = {};
updated.filter(b => !findSbMatch(b.Name)).forEach(b => {
  typeCounts[b.type] = (typeCounts[b.type] || 0) + 1;
});
console.log('\nInferred type distribution:');
Object.entries(typeCounts).sort((a,b) => b[1]-a[1]).slice(0, 15).forEach(([t,c]) => {
  console.log(`  ${t}: ${c}`);
});
