const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');

const env = process.argv[2];
if (!env) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: You must specify an environment (e.g., "local", "dev", "prod").');
    console.error('Usage: node env-loader.js <env> <expo_command>');
    process.exit(1);
}

const command = process.argv.slice(3).join(' ');
if (!command) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: You must specify an Expo command to run.');
    process.exit(1);
}

const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.error('\x1b[31m%s\x1b[0m', `Error: .env file not found at ${envPath}`);
    process.exit(1);
}

const envFileContent = fs.readFileSync(envPath, 'utf8');

let apiUrl, appKey;
const urlKey = `EXPO_PUBLIC_API_URL_${env.toUpperCase()}`;

envFileContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        const value = valueParts.join('=').trim();

        if (key.trim() === urlKey) {
            apiUrl = value;
        }
        if (key.trim() === 'EXPO_PUBLIC_APP_KEY') {
            appKey = value;
        }
    }
});

if (!apiUrl) {
    console.error('\x1b[31m%s\x1b[0m', `Error: No API URL found for key "${urlKey}" in .env file.`);
    process.exit(1);
}

if (!appKey) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: EXPO_PUBLIC_APP_KEY not found in .env file.');
    process.exit(1);
}

process.env.EXPO_PUBLIC_API_URL = apiUrl;
process.env.EXPO_PUBLIC_APP_KEY = appKey;

console.log('\n\x1b[32m%s\x1b[0m', `✅ Using environment: ${env}`);
console.log(`   - API URL: ${apiUrl}`);
console.log(`   - App Key: ****${appKey.slice(-4)}`);
console.log('\x1b[36m%s\x1b[0m', `🚀 Executing: npx expo ${command}\n`);

try {
    execSync(`npx expo ${command}`, {stdio: 'inherit'});
} catch (error) {
    console.error('\n\x1b[31m%s\x1b[0m', `❌ Command "npx expo ${command}" failed.`);
    process.exit(1);
}