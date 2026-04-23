const fs = require('fs');
const path = require('path');

function extractRows(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw);
  const text = parsed[0].text;
  const startTag = text.indexOf('[{');
  const endTag = text.lastIndexOf('}]') + 2;
  if (startTag === -1) return [];
  const jsonStr = text.substring(startTag, endTag);
  return JSON.parse(jsonStr);
}

const toolResultsDir = '/tmp/cc-agent/52334578/.claude/projects/-tmp-cc-agent-52334578-project/7cf7afc3-082d-49d9-954d-5f985487d773/tool-results';

// Use the full-query file (all 496 rows)
const fullQueryFile = path.join(toolResultsDir, 'mcp-supabase-execute_sql-1776954016142.txt');
const rows = extractRows(fullQueryFile);

console.log('Total rows:', rows.length);

const headers = ['id','ticket_type','status','ticket_number','qr_code_data','event_name','event_date','validated_at','order_id','created_at','email','first_name','last_name','display_name','phone_number'];

const escape = (val) => {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
};

const lines = [headers.join(',')];
for (const row of rows) {
  lines.push(headers.map(h => escape(row[h])).join(','));
}

const csv = lines.join('\n');
fs.writeFileSync('/tmp/cc-agent/52334578/project/tickets_export.csv', csv, 'utf8');
console.log('CSV written with', rows.length, 'rows to tickets_export.csv');
