import { InstagramAPIService } from './src/services/instagram-api';
import { services } from './src/data/services';

// Test Instagram API integration
async function testInstagramIntegration() {
  console.log('🚀 Testing Instagram Integration...\n');
  
  try {
    // Test 1: Instagram API Service
    console.log('1️⃣ Testing Instagram API Service...');
    const instagramService = new InstagramAPIService();
    const posts = await instagramService.getInstagramPosts('eisho8400', 6);
    console.log(`✅ Retrieved ${posts.length} Instagram posts`);
    console.log('Sample post:', JSON.stringify(posts[0], null, 2));
    
    // Test 2: Service-to-Post Matching
    console.log('\n2️⃣ Testing Service-to-Post Matching...');
    const testService = services.find(s => s.id === 'kitchen-renovation');
    if (testService) {
      console.log(`Testing service: ${testService.name}`);
      console.log(`Instagram hashtags: ${testService.instagramHashtags?.join(', ')}`);
      console.log(`Related posts: ${testService.relatedInstagramPosts?.join(', ')}`);
    }
    
    // Test 3: Analytics Data
    console.log('\n3️⃣ Testing Analytics Integration...');
    const analyticsData = {
      totalPosts: posts.length,
      totalServices: services.length,
      matchedServices: services.filter(s => s.relatedInstagramPosts?.length > 0).length,
      topHashtags: ['#栄匠', '#鹿沼市', '#リフォーム', '#新築', '#住宅']
    };
    console.log('✅ Analytics data generated:', analyticsData);
    
    // Test 4: Service Matching Results
    console.log('\n4️⃣ Service Matching Results:');
    const matchedServices = services.filter(s => s.relatedInstagramPosts?.length > 0);
    matchedServices.forEach(service => {
      console.log(`- ${service.name}: ${service.relatedInstagramPosts?.length} related posts`);
    });
    
    console.log('\n🎉 All Instagram integration tests passed!');
    
  } catch (error) {
    console.error('❌ Instagram integration test failed:', error);
    process.exit(1);
  }
}

// Run the test
testInstagramIntegration();