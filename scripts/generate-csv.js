const fs = require('fs');
const path = require('path');

const beers = JSON.parse(fs.readFileSync(path.join(__dirname, '../resources/Beer.json'), 'utf8'));

function escapeCsv(val) {
  if (val == null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

const columns = [
  { csv: 'name',        json: 'Name' },
  { csv: 'description', json: 'Description' },
  { csv: 'brewery',     json: 'Brewery' },
  { csv: 'real',        json: 'Real' },
  { csv: 'createdAt',   json: 'createdAt' },
  { csv: 'abv',         json: 'abv' },
  { csv: 'type',        json: 'type' },
];
const headers = columns.map(c => c.csv);
const rows = beers.map(b => columns.map(c => escapeCsv(b[c.json])).join(','));

const csv = [headers.join(','), ...rows].join('\n');
const out = path.join(__dirname, '../resources/Beer.csv');
fs.writeFileSync(out, csv);
console.log(`Written ${beers.length} rows to Beer.csv`);
