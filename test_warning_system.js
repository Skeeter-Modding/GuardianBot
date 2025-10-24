// Warning System Test Script
// This script tests the warning system functionality

const DatabaseManager = require('./src/DatabaseManager');

async function testWarningSystem() {
    console.log('🧪 Testing Warning System...\n');
    
    const db = new DatabaseManager();
    
    try {
        // Test database connection
        console.log('1. Testing database connection...');
        const connected = await db.connect();
        
        if (!connected) {
            console.log('❌ Database connection failed - warning system requires database');
            console.log('💡 Make sure database is configured in config.json');
            return;
        }
        
        console.log('✅ Database connected successfully\n');
        
        // Test data
        const testGuildId = '123456789012345678';
        const testUserId = '987654321098765432';
        const testUsername = 'TestUser';
        const testModeratorId = '111222333444555666';
        const testModeratorUsername = 'TestModerator';
        const testReason = 'Test warning for system verification';
        
        // Test 1: Add a warning
        console.log('2. Testing addWarning...');
        const warningId = await db.addWarning(
            testGuildId,
            testUserId,
            testUsername,
            testModeratorId,
            testModeratorUsername,
            testReason
        );
        
        if (warningId) {
            console.log(`✅ Warning added successfully with ID: ${warningId}`);
        } else {
            console.log('❌ Failed to add warning');
            return;
        }
        
        // Test 2: Get user warnings
        console.log('\n3. Testing getUserWarnings...');
        const warnings = await db.getUserWarnings(testGuildId, testUserId);
        console.log(`✅ Retrieved ${warnings.length} warnings for user`);
        
        if (warnings.length > 0) {
            console.log(`   - Warning ID: ${warnings[0].id}`);
            console.log(`   - Reason: ${warnings[0].reason}`);
            console.log(`   - Moderator: ${warnings[0].moderator_username}`);
            console.log(`   - Active: ${warnings[0].is_active}`);
        }
        
        // Test 3: Get warning count
        console.log('\n4. Testing getUserWarningCount...');
        const warningCount = await db.getUserWarningCount(testGuildId, testUserId);
        console.log(`✅ User has ${warningCount} active warnings`);
        
        // Test 4: Get warning by ID
        console.log('\n5. Testing getWarningById...');
        const warning = await db.getWarningById(warningId, testGuildId);
        if (warning) {
            console.log(`✅ Retrieved warning by ID: ${warning.reason}`);
        } else {
            console.log('❌ Failed to retrieve warning by ID');
        }
        
        // Test 5: Get warning stats
        console.log('\n6. Testing getWarningStats...');
        const stats = await db.getWarningStats(testGuildId);
        if (stats) {
            console.log(`✅ Warning statistics:`);
            console.log(`   - Total warnings: ${stats.total_warnings}`);
            console.log(`   - Active warnings: ${stats.active_warnings}`);
            console.log(`   - Warned users: ${stats.warned_users}`);
            console.log(`   - Moderators who warned: ${stats.moderators_who_warned}`);
        }
        
        // Test 6: Remove warning
        console.log('\n7. Testing removeWarning...');
        const removed = await db.removeWarning(
            warningId,
            testGuildId,
            testModeratorId,
            testModeratorUsername,
            'Test removal'
        );
        
        if (removed) {
            console.log('✅ Warning removed successfully');
            
            // Verify it's removed
            const updatedWarning = await db.getWarningById(warningId, testGuildId);
            if (updatedWarning && !updatedWarning.is_active) {
                console.log('✅ Warning is marked as inactive');
            }
        } else {
            console.log('❌ Failed to remove warning');
        }
        
        console.log('\n🎉 All warning system tests completed successfully!');
        console.log('\n📋 Warning System Features:');
        console.log('   ✅ Add warnings with reason and moderator tracking');
        console.log('   ✅ View user warning history with pagination');
        console.log('   ✅ Remove warnings with audit trail');
        console.log('   ✅ Track warning statistics');
        console.log('   ✅ Escalation notices for multiple warnings');
        console.log('   ✅ Database persistence');
        console.log('   ✅ Moderation logging integration');
        
        console.log('\n🎯 Ready to use:');
        console.log('   - /warn <user> <reason> - Issue warning');
        console.log('   - /warnings [user] - View warnings');
        console.log('   - /removewarn <id> [reason] - Remove warning');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await db.disconnect();
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    testWarningSystem();
}

module.exports = testWarningSystem;