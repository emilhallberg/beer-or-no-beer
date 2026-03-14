const fs = require('fs');
const path = require('path');

const beers = JSON.parse(fs.readFileSync(path.join(__dirname, '../resources/Beer.json'), 'utf8'));

function escape(str) {
  if (str == null) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

const rows = beers.map(b => {
  const name = escape(b.Name);
  const desc = escape(b.Description);
  const real = b.Real ? 'true' : 'false';
  const createdAt = escape(b.createdAt);
  const brewery = escape(b.Brewery);
  const abv = b.abv != null ? b.abv : 0.0;
  const type = escape(b.type);
  return `  (${name}, ${desc}, ${real}, ${createdAt}, ${brewery}, ${abv}, ${type}, '{}'::jsonb)`;
});

const chunkSize = 500;
const inserts = [];
for (let i = 0; i < rows.length; i += chunkSize) {
  const chunk = rows.slice(i, i + chunkSize);
  inserts.push(
    `insert into public.beers ("name", "description", "real", "createdAt", "brewery", "abv", "type", "meta") values\n${chunk.join(',\n')};`
  );
}

const existing = fs.readFileSync(path.join(__dirname, '../supabase/seed.sql'), 'utf8');
const beerBlock = `\n-- Beers (${beers.length} entries)\n${inserts.join('\n\n')}\n`;
fs.writeFileSync(path.join(__dirname, '../supabase/seed.sql'), existing + beerBlock);

console.log(`Appended ${beers.length} beers to seed.sql in ${inserts.length} batches.`);
