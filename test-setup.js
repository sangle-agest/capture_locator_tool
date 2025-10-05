// Test script to verify the Smart Locator Inspector setup
const CDP = require('chrome-remote-interface');
const { spawn } = require('child_process');
const fs = require('fs');

async function testSetup() {
    console.log('🧪 Testing Smart Locator Inspector Setup...\n');

    // Test 1: Check Node.js version
    console.log('✅ Node.js version:', process.version);

    // Test 2: Check chrome-remote-interface
    try {
        console.log('✅ chrome-remote-interface loaded successfully');
    } catch (error) {
        console.log('❌ chrome-remote-interface failed to load:', error.message);
        return;
    }

    // Test 3: Check if Chrome is installed
    const chromePaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        process.env.CHROME_PATH
    ].filter(Boolean);

    let chromeFound = false;
    for (const path of chromePaths) {
        if (fs.existsSync(path)) {
            console.log('✅ Chrome found at:', path);
            chromeFound = true;
            break;
        }
    }

    if (!chromeFound) {
        console.log('❌ Chrome not found in standard locations');
        console.log('💡 Please install Chrome or set CHROME_PATH environment variable');
        return;
    }

    // Test 4: Check injector script
    const injectorPath = './injector.js';
    if (fs.existsSync(injectorPath)) {
        console.log('✅ Injector script found');
    } else {
        console.log('❌ Injector script missing');
        return;
    }

    console.log('\n🎯 Setup verification complete!');
    console.log('📖 Ready to use Smart Locator Inspector');
    console.log('\n🚀 Usage:');
    console.log('   node smart-locator.js https://example.com');
    console.log('   npm start https://google.com');
}

testSetup().catch(console.error);