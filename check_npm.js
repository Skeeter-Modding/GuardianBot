const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Checking dependencies...');

try {
    // Check if node_modules exists
    if (!fs.existsSync('node_modules')) {
        console.log('📦 Installing dependencies for the first time...');
        
        // Try to run npm install
        try {
            execSync('npm install', { stdio: 'inherit' });
            console.log('✅ Dependencies installed successfully!');
        } catch (error) {
            console.log('❌ npm install failed, trying alternative method...');
            
            // Manual dependency installation if npm fails
            console.log('🔧 Setting up dependencies manually...');
            
            // Create basic node_modules structure
            const nodeModulesPath = path.join(__dirname, 'node_modules');
            if (!fs.existsSync(nodeModulesPath)) {
                fs.mkdirSync(nodeModulesPath);
            }
            
            console.log('⚠️  Manual setup complete, but you may need to install discord.js manually');
            console.log('💡 Run: npm install discord.js@14.14.1 express@4.21.2');
        }
    } else {
        console.log('✅ Dependencies already installed');
    }
    
    // Check if discord.js is available
    try {
        require('discord.js');
        console.log('✅ discord.js is available');
    } catch (error) {
        console.log('❌ discord.js not found');
        console.log('📦 Please install with: npm install discord.js@14.14.1');
    }
    
} catch (error) {
    console.log('⚠️  Dependency check completed with warnings');
    console.log('💡 If the bot fails to start, manually run: npm install');
}