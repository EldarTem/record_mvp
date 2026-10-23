#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { networkInterfaces } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const certsDir = join(root, '.certs');
const keyPath = join(certsDir, 'key.pem');
const certPath = join(certsDir, 'cert.pem');
const confPath = join(certsDir, 'openssl.cnf');

const force = process.argv.includes('--force');

function localIps() {
  const ips = new Set();
  for (const list of Object.values(networkInterfaces())) {
    for (const net of list ?? []) {
      if (net.family === 'IPv4' && !net.internal) ips.add(net.address);
    }
  }
  return [...ips];
}

if (!force && existsSync(keyPath) && existsSync(certPath)) {
  console.log('Certs already exist in .certs/ (use --force to regenerate)');
  process.exit(0);
}

mkdirSync(certsDir, { recursive: true });

const ips = localIps();
const dnsNames = ['localhost', '*.localhost'];
const ipNames = ['127.0.0.1', '::1', ...ips];

const altLines = [
  ...dnsNames.map((name, i) => `DNS.${i + 1} = ${name}`),
  ...ipNames.map((ip, i) => `IP.${i + 1} = ${ip}`),
];

const opensslCnf = `
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
x509_extensions = v3_req

[dn]
CN = myturn-dev
O = MyTurn Local Dev

[v3_req]
subjectAltName = @alt_names
basicConstraints = CA:false
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth

[alt_names]
${altLines.join('\n')}
`.trimStart();

writeFileSync(confPath, opensslCnf);

execFileSync(
  'openssl',
  [
    'req',
    '-x509',
    '-nodes',
    '-newkey',
    'rsa:2048',
    '-keyout',
    keyPath,
    '-out',
    certPath,
    '-days',
    '825',
    '-config',
    confPath,
    '-extensions',
    'v3_req',
  ],
  { stdio: 'inherit' },
);

writeFileSync(
  join(certsDir, 'ips.json'),
  JSON.stringify({ ips, generatedAt: new Date().toISOString() }, null, 2),
);

console.log('\nHTTPS certs generated in .certs/');
console.log('SAN:');
for (const line of altLines) console.log(`  ${line}`);
if (ips.length) {
  console.log('\nPhone URL (same Wi‑Fi):');
  for (const ip of ips) console.log(`  https://${ip}:5173`);
} else {
  console.log('\nNo LAN IP found. Connect to Wi‑Fi and rerun: npm run certs -- --force');
}
console.log(
  '\nBrowser will warn about the self-signed cert — tap Advanced → Proceed.',
);
console.log(
  'iOS: install the cert, then enable trust in Settings → General → About → Certificate Trust Settings.',
);
