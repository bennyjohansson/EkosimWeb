/**
 * Test script to validate authentication configuration and dependencies
 */

const dotenv = require('dotenv')
dotenv.config()

console.log('🧪 Testing Authentication Configuration...\n')

try {
  // Test basic environment loading
  console.log('📋 Environment variables loaded:')
  console.log('- JWT_SECRET set:', !!process.env.JWT_SECRET)
  console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set')
  console.log('- DATABASE_PATH:', process.env.DATABASE_PATH || './myDB/')
  console.log('')

  // Test dependencies
  console.log('📦 Testing dependencies...')
  
  const jwt = require('jsonwebtoken')
  const bcrypt = require('bcryptjs')
  const passport = require('passport')
  
  console.log('✅ jsonwebtoken loaded')
  console.log('✅ bcryptjs loaded') 
  console.log('✅ passport loaded')
  console.log('')

  // Test JWT functionality
  console.log('🔐 Testing JWT functionality...')
  const testSecret = process.env.JWT_SECRET || 'test-secret'
  const testToken = jwt.sign({ userId: 'test' }, testSecret, { expiresIn: '1h' })
  const decoded = jwt.verify(testToken, testSecret)
  console.log('✅ JWT sign/verify working')
  console.log('- Token created for user:', decoded.userId)
  console.log('')

  // Test bcrypt functionality
  console.log('🔒 Testing bcrypt functionality...')
  const testPassword = 'testpassword123'
  const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '10')
  const hashedPassword = bcrypt.hashSync(testPassword, bcryptRounds)
  const isValid = bcrypt.compareSync(testPassword, hashedPassword)
  console.log('✅ bcrypt hash/compare working')
  console.log('- Bcrypt rounds:', bcryptRounds)
  console.log('- Password validation:', isValid)
  console.log('')

  console.log('🎉 All authentication components ready!')
  console.log('🚀 Ready for cloud deployment configuration')

} catch (error) {
  console.error('❌ Configuration test failed:', error.message)
  process.exit(1)
}
