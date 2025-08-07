const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const env = process.argv[2];
if (!env) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: You must specify an environment (e.g., "local", "dev", "prod").');
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

envFileContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        const value = valueParts.join('=').trim();
        const trimmedKey = key.trim();

        if (trimmedKey.startsWith('EXPO_PUBLIC_')) {
            process.env[trimmedKey] = value;
        }
    }
});

const apiUrlKey = `EXPO_PUBLIC_API_URL_${env.toUpperCase()}`;
const apiUrl = process.env[apiUrlKey];

if (!apiUrl) {
    console.error('\x1b[31m%s\x1b[0m', `Error: No API URL found for key "${apiUrlKey}" in .env file.`);
    process.exit(1);
}

process.env.EXPO_PUBLIC_API_URL = apiUrl;

console.log('\n\x1b[32m%s\x1b[0m', `✅ Using environment: ${env}`);
console.log(`   - API URL set to: ${process.env.EXPO_PUBLIC_API_URL}`);
console.log(`   - App Key Loaded: ${!!process.env.EXPO_PUBLIC_APP_KEY}`);
console.log('\x1b[36m%s\x1b[0m', `🚀 Executing: npx expo ${command}\n`);

try {
    execSync(`npx expo ${command}`, { stdio: 'inherit' });
} catch (error) {
    console.error('\n\x1b[31m%s\x1b[0m', `❌ Command "npx expo ${command}" failed.`);
    process.exit(1);
}