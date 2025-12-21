/**
 * Test PostgreSQL connection for EkoSim migration
 */

const { Client } = require('pg');

async function testPostgreSQLConnection() {
    console.log('🔌 Testing PostgreSQL connection...');
    
    // First try to connect to template1 database (should always exist)
    const testClient = new Client({
        host: 'localhost',
        port: 5432,
        database: 'template1',
        user: 'ekosim',
        password: 'dev_password_change_in_production',
        connectionTimeoutMillis: 10000,
    });

    try {
        console.log('🔄 Testing connection to template1 database...');
        await testClient.connect();
        console.log('✅ Successfully connected to template1');
        
        // Check if we can see our databases
        const dbResult = await testClient.query('SELECT datname FROM pg_database ORDER BY datname');
        console.log('📋 Available databases:');
        dbResult.rows.forEach(db => {
            console.log(`  - ${db.datname}`);
        });
        
        await testClient.end();
    } catch (templateError) {
        console.error('❌ Connection to template1 failed:', templateError.message);
        await testClient.end();
    }
    
    // Now try the main ekosim database
    const client = new Client({
        host: 'localhost',
        port: 5432,
        database: 'ekosim',
        user: 'ekosim',
        password: 'dev_password_change_in_production',
        connectionTimeoutMillis: 10000,
    });

    try {
        console.log('🔄 Attempting connection to ekosim database...');
        await client.connect();
        console.log('✅ Successfully connected to PostgreSQL');

        // Test basic query
        const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
        console.log('⏰ Current time:', result.rows[0].current_time);
        console.log('🐘 PostgreSQL version:', result.rows[0].postgres_version);

        // Test users table exists
        const tableCheck = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'users'
        `);
        
        if (tableCheck.rows.length > 0) {
            console.log('✅ Users table exists');
            
            // Get user count
            const userCount = await client.query('SELECT COUNT(*) as count FROM users');
            console.log(`📊 Current user count: ${userCount.rows[0].count}`);
            
            // Show table schema
            const schema = await client.query(`
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = 'users'
                ORDER BY ordinal_position
            `);
            
            console.log('📋 Users table schema:');
            schema.rows.forEach(col => {
                console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
            });
        } else {
            console.log('⚠️  Users table not found');
        }

    } catch (error) {
        console.error('❌ PostgreSQL connection failed:');
        console.error('  Error message:', error.message);
        console.error('  Error code:', error.code);
        console.error('  Error detail:', error.detail);
        console.error('  Full error:', error);
        throw error;
    } finally {
        await client.end();
        console.log('🔒 Connection closed');
    }
}

// Run the test
testPostgreSQLConnection()
    .then(() => {
        console.log('✅ PostgreSQL connection test completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ PostgreSQL connection test failed:', error.message);
        process.exit(1);
    });