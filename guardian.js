// Guardian Bot with Integrated Dashboard
// Main entry point that starts both bot and dashboard

const GuardianBot = require('./bot.js');
const GuardianDashboard = require('./dashboard/server.js');

async function startGuardianSystem() {
    console.log('🚀 Starting Guardian Bot System...');
    
    try {
        // Start the Discord bot
        console.log('🤖 Initializing Discord bot...');
        const bot = new GuardianBot();
        await bot.start();
        
        // Start the dashboard
        console.log('🌐 Initializing web dashboard...');
        const dashboard = new GuardianDashboard(bot);
        dashboard.start();
        
        console.log('✅ Guardian Bot System fully operational!');
        console.log('🛡️ Bot Status: Online and protecting servers');
        console.log('📊 Dashboard: http://localhost:3000');
        console.log('👑 Admin Panel: http://localhost:3000/admin');
        console.log('🎫 Staff Panel: http://localhost:3000/tickets');
        
    } catch (error) {
        console.error('❌ Failed to start Guardian system:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🔄 Shutting down Guardian Bot System...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🔄 Shutting down Guardian Bot System...');
    process.exit(0);
});

// Start the system
startGuardianSystem();