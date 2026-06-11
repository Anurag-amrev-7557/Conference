import { readFileSync, writeFileSync } from 'node:fs';

const path = 'src/lib/api.ts';
let src = readFileSync(path, 'utf8');

src = src.replace(
  `  async login(username: string, password: string) {
    const res = await fetch(\`\${API_BASE}/auth/login\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });`,
  `  async login(username: string, password: string) {
    const res = await fetch(\`\${API_BASE}/auth/login\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });`,
);

src = src.replaceAll(
  /const res = await fetch\(`\$\{API_BASE\}\/admin\/([^`]+)`, \{\n      headers: \{ Authorization: `Bearer \$\{token\}` \},?\n    \}\);/g,
  'const res = await fetch(`${API_BASE}/admin/$1`, adminFetchInit(token));',
);

src = src.replaceAll(
  /const res = await fetch\(`\$\{API_BASE\}\/admin\/([^`]+)`, \{\n      method: '([^']+)',\n      headers: \{ Authorization: `Bearer \$\{token\}` \},?\n    \}\);/g,
  "const res = await fetch(`${API_BASE}/admin/$1`, adminFetchInit(token, { method: '$2' }));",
);

src = src.replaceAll(
  /const res = await fetch\(`\$\{API_BASE\}\/admin\/([^`]+)`, \{\n      method: '([^']+)',\n      headers: \{\n        Authorization: `Bearer \$\{token\}`,\n        'Content-Type': 'application\/json',\n      \},\n      body: ([^\n]+)\n    \}\);/g,
  "const res = await fetch(`${API_BASE}/admin/$1`, adminFetchInit(token, {\n      method: '$2',\n      headers: { 'Content-Type': 'application/json' },\n      body: $3\n    }));",
);

src = src.replaceAll(
  /const res = await fetch\(`\$\{API_BASE\}\/admin\/([^`]+)`, \{\n      method: '([^']+)',\n      headers: \{ Authorization: `Bearer \$\{token\}` \},\n      body: ([^\n]+)\n    \}\);/g,
  "const res = await fetch(`${API_BASE}/admin/$1`, adminFetchInit(token, { method: '$2', body: $3 }));",
);

src = src.replaceAll(
  /const res = await fetch\(`\$\{API_BASE\}\/admin\/([^`]+)`, \{\n      method: '([^']+)',\n      headers: \{\n        'Content-Type': 'application\/json',\n        'Authorization': `Bearer \$\{token\}`\n      \},\n      body: ([^\n]+)\n    \}\);/g,
  "const res = await fetch(`${API_BASE}/admin/$1`, adminFetchInit(token, {\n      method: '$2',\n      headers: { 'Content-Type': 'application/json' },\n      body: $3\n    }));",
);

writeFileSync(path, src);
console.log('[patch-api-admin-fetch] done');
