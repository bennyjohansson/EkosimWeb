/**
 * Initialize user database for EkoSim authentication
 */

const UserDatabase = require('./database/UserDatabase');
const path = require('path');

async function initializeUserDatabase() {
    console.log('🔐 Initializing user database...');
    
    try {
        const userDb = new UserDatabase('./myDB/');
        await userDb.initializeDatabase();
        
        // Test the connection
        await userDb.testConnection();
        
        console.log('✅ User database initialization complete!');
        console.log('📂 Database created at: ./myDB/users.db');
        
    } catch (error) {
        console.error('❌ Failed to initialize user database:', error.message);
        process.exit(1);
    }
}

// Run initialization
initializeUserDatabase();
