import json, csv, re, sys

src = '/tmp/cc-agent/52334578/.claude/projects/-tmp-cc-agent-52334578-project/7cf7afc3-082d-49d9-954d-5f985487d773/tool-results/mcp-supabase-execute_sql-1776954016142.txt'

with open(src) as f:
    raw = f.read()

parsed = json.loads(raw)
text = parsed[0]['text']

start = text.index('[{')
end = text.rindex('}]') + 2
rows = json.loads(text[start:end])

print(f'Total rows: {len(rows)}', file=sys.stderr)

headers = ['id','ticket_type','status','ticket_number','qr_code_data','event_name','event_date','validated_at','order_id','created_at','email','first_name','last_name','display_name','phone_number']

out = '/tmp/cc-agent/52334578/project/tickets_export.csv'
with open(out, 'w', newline='') as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames=headers, extrasaction='ignore')
    writer.writeheader()
    writer.writerows(rows)

print(f'Done: {len(rows)} rows written to tickets_export.csv', file=sys.stderr)
