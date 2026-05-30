const { InstagramAPIService } = require('./src/services/instagram-api.ts');
const { InstagramServiceIntegration } = require('./src/components/InstagramServiceIntegration.tsx');
const { services } = require('./src/data/services.ts');

// Test Instagram API integration
async function testInstagramIntegration() {
  console.log('🚀 Testing Instagram Integration...\n');
  
  try {
    // Test 1: Instagram API Service
    console.log('1️⃣ Testing Instagram API Service...');
    const instagramService = new InstagramAPIService();
    const posts = await instagramService.getInstagramPosts('eisho8400', 6);
    console.log(`✅ Retrieved ${posts.length} Instagram posts`);
    console.log('Sample post:', posts[0]);
    
    // Test 2: Service Integration
    console.log('\n2️⃣ Testing Service Integration...');
    const serviceIntegration = new InstagramServiceIntegration({
      services: services.slice(0, 3), // Test with first 3 services
      instagramPosts: posts,
      showAnalytics: true
    });
    
    console.log('✅ Service integration component created');
    
    // Test 3: Service-to-Post Matching
    console.log('\n3️⃣ Testing Service-to-Post Matching...');
    const testService = services.find(s => s.id === 'kitchen-renovation');
    if (testService) {
      console.log(`Testing service: ${testService.name}`);
      console.log(`Instagram hashtags: ${testService.instagramHashtags?.join(', ')}`);
      console.log(`Related posts: ${testService.relatedInstagramPosts?.join(', ')}`);
    }
    
    // Test 4: Analytics Data
    console.log('\n4️⃣ Testing Analytics Integration...');
    const analyticsData = {
      totalPosts: posts.length,
      totalServices: services.length,
      matchedServices: services.filter(s => s.relatedInstagramPosts?.length > 0).length,
      topHashtags: ['#栄匠', '#鹿沼市', '#リフォーム', '#新築', '#住宅']
    };
    console.log('✅ Analytics data generated:', analyticsData);
    
    console.log('\n🎉 All Instagram integration tests passed!');
    
  } catch (error) {
    console.error('❌ Instagram integration test failed:', error);
    process.exit(1);
  }
}

// Run the test
testInstagramIntegration();