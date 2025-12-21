/**
 * Debug PostgreSQL users and roles
 */

const { Client } = require('pg');

async function debugPostgreSQLUsers() {
    console.log('🔍 Debugging PostgreSQL users and roles...');
    
    // Try connecting to the postgres system database first
    const client = new Client({
        host: 'localhost',
        port: 5432,
        database: 'postgres', // Connect to default postgres database
        user: 'ekosim',
        password: 'dev_password_change_in_production',
        connectionTimeoutMillis: 10000,
    });

    try {
        console.log('🔄 Attempting connection to postgres database...');
        await client.connect();
        console.log('✅ Successfully connected to postgres database');

        // List all roles
        const roles = await client.query('SELECT rolname, rolsuper, rolcanlogin FROM pg_roles ORDER BY rolname');
        console.log('📋 Available roles:');
        roles.rows.forEach(role => {
            console.log(`  - ${role.rolname} (superuser: ${role.rolsuper}, can login: ${role.rolcanlogin})`);
        });

        // List all databases
        const databases = await client.query('SELECT datname FROM pg_database ORDER BY datname');
        console.log('📋 Available databases:');
        databases.rows.forEach(db => {
            console.log(`  - ${db.datname}`);
        });

    } catch (error) {
        console.error('❌ Connection to postgres database failed:', error.message);
        
        // Try with different connection approaches
        console.log('🔄 Trying alternative connections...');
        
        try {
            const clientAlt = new Client({
                host: 'localhost',
                port: 5432,
                database: 'ekosim',
                user: 'postgres',
                password: 'postgres',
                connectionTimeoutMillis: 5000,
            });
            await clientAlt.connect();
            console.log('✅ Connected with postgres/postgres');
            await clientAlt.end();
        } catch (err2) {
            console.error('❌ postgres/postgres failed:', err2.message);
        }

    } finally {
        try {
            await client.end();
            console.log('🔒 Connection closed');
        } catch (err) {
            // Ignore close errors
        }
    }
}

// Run the debug
debugPostgreSQLUsers()
    .then(() => {
        console.log('✅ Debug completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Debug failed:', error.message);
        process.exit(1);
    });