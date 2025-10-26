const UserService = require('./services/UserService');

async function testCountryAccess() {
  try {
    console.log('🧪 Testing Country Access Control...');
    const authConfig = {
      jwt: { secret: 'test-secret' },
      providers: { local: { bcryptRounds: 10 } },
      database: { path: './myDB/' }
    };
    
    const userService = new UserService(authConfig);
    await userService.initialize();
    
    // Test 1: Get user countries for existing user
    console.log('\n📍 Testing user country access...');
    const userCountries = await userService.getUserCountries('c6e47ec4-7f28-4a52-a912-f4339b8fb0ec');
    console.log('User countries:', userCountries);
    
    // Test 2: Check specific country access
    console.log('\n🔍 Testing specific country access check...');
    const access = await userService.checkUserCountryAccess('c6e47ec4-7f28-4a52-a912-f4339b8fb0ec', 'Bennyland');
    console.log('Bennyland access:', access);
    
    // Test 3: Try to assign a country to user
    console.log('\n🏗️ Testing country assignment...');
    try {
      const assignment = await userService.assignCountryToUser(
        'c6e47ec4-7f28-4a52-a912-f4339b8fb0ec', 
        'Bennyland', 
        'admin-test', 
        'full'
      );
      console.log('✅ Country assigned:', assignment);
    } catch (error) {
      console.log('Country assignment:', error.message);
    }
    
    // Test 4: Check access again after assignment
    console.log('\n🔍 Testing access after assignment...');
    const accessAfter = await userService.checkUserCountryAccess('c6e47ec4-7f28-4a52-a912-f4339b8fb0ec', 'Bennyland');
    console.log('Bennyland access after assignment:', accessAfter);
    
    // Test 5: Test admin user (create one first)
    console.log('\n👨‍💼 Testing admin user creation...');
    try {
      const adminUser = await userService.registerUser({
        username: 'admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
        level: 'expert'
      });
      console.log('✅ Admin user created:', adminUser.id);
      
      // Test admin access
      const adminAccess = await userService.checkUserCountryAccess(adminUser.id, 'AnyCountry');
      console.log('Admin access to any country:', adminAccess);
      
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Admin user already exists, testing access...');
        // Get existing admin user and test
        const adminUser = await userService.authenticateUser('admin@example.com', 'password123');
        const adminAccess = await userService.checkUserCountryAccess(adminUser.id, 'AnyCountry');
        console.log('Admin access to any country:', adminAccess);
      } else {
        throw error;
      }
    }
    
    console.log('\n🎉 All country access tests completed!');
    
  } catch (error) {
    console.error('❌ Country access test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testCountryAccess();
