/**
 * Test country assignment for PostgreSQL users
 */

const UserService = require('./services/UserService');

async function testCountryAccess() {
  console.log('🏴 Testing country access with PostgreSQL...\n');

  try {
    const authConfig = {
      database: { path: './myDB/' },
      providers: { local: { bcryptRounds: 12 } },
      jwt: { secret: 'test-secret-key', expiresIn: '24h' }
    };

    const userService = new UserService(authConfig);
    await userService.initialize();

    // Get our test user's ID
    const testUser = await userService.userDb.getUserByEmail('api_new@example.com');
    if (!testUser) {
      console.error('❌ Test user not found');
      process.exit(1);
    }

    console.log(`👤 Found test user: ${testUser.email} (${testUser.id})`);

    // Check current country access
    console.log('🔍 Checking current country access...');
    const countries = await userService.getUserCountries(testUser.id);
    console.log('Current access:', JSON.stringify(countries, null, 2));

    // Assign a country to the user
    console.log('🏴 Assigning Bennyland access...');
    await userService.assignCountryToUser(testUser.id, 'Bennyland', testUser.id);

    // Check country access again
    console.log('🔍 Checking country access after assignment...');
    const updatedCountries = await userService.getUserCountries(testUser.id);
    console.log('Updated access:', JSON.stringify(updatedCountries, null, 2));

    // Test specific country access
    console.log('🔍 Testing specific country access checks...');
    const bennylandAccess = await userService.checkUserCountryAccess(testUser.id, 'Bennyland');
    console.log('Bennyland access:', bennylandAccess);

    const saralandAccess = await userService.checkUserCountryAccess(testUser.id, 'Saraland');
    console.log('Saraland access:', saralandAccess);

    // Clean up
    await userService.userDb.close();
    console.log('\n✅ Country access test completed successfully!');

  } catch (error) {
    console.error('❌ Country access test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testCountryAccess();
