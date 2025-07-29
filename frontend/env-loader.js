const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get environment and command from arguments
const env = process.argv[2] || 'dev'; // default to dev
const command = process.argv.slice(3).join(' '); // capture all remaining args

const envPath = path.join(__dirname, '.env');
const envFile = fs.readFileSync(envPath, 'utf8');

let apiUrl;
const lines = envFile.split('\n');
for (const line of lines) {
  if (line.startsWith(`EXPO_PUBLIC_API_URL_${env.toUpperCase()}`)) {
    apiUrl = line.split('=')[1].trim();
    break;
  }
}

if (!apiUrl) {
  console.error(`No API URL found for environment: ${env}`);
  process.exit(1);
}

process.env.EXPO_PUBLIC_API_URL = apiUrl;
console.log(`Running command with ${env} environment (API: ${apiUrl})`);
console.log(`Executing: expo ${command}`);

execSync(`npx expo ${command}`, { stdio: 'inherit' });