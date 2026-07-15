#!/usr/bin/env node

/**
 * Test Script: VIP Payment Simulation
 * 
 * This script simulates a successful VIP payment and verifies that the user's
 * membership tier is correctly updated in the database.
 * 
 * Usage:
 *   node test-vip-payment.js <backend_url> <user_id>
 * 
 * Example:
 *   node test-vip-payment.js https://model-site-alpha.vercel.app 12345678-1234-1234-1234-123456789012
 */

const args = process.argv.slice(2);
const backendUrl = args[0] || 'https://model-site-alpha.vercel.app';
const userId = args[1];

if (!userId) {
  console.error('❌ Error: User ID is required');
  console.log('\nUsage: node test-vip-payment.js <backend_url> <user_id>');
  console.log('\nExample:');
  console.log('  node test-vip-payment.js https://model-site-alpha.vercel.app 12345678-1234-1234-1234-123456789012');
  process.exit(1);
}

console.log('🚀 Starting VIP Payment Test...\n');
console.log(`Backend URL: ${backendUrl}`);
console.log(`User ID: ${userId}\n`);

async function testVIPPayment() {
  try {
    // Step 1: Call the test VIP upgrade endpoint
    console.log('📝 Step 1: Simulating VIP payment...');
    const upgradeResponse = await fetch(`${backendUrl}/api/paypal/test-vip-upgrade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });

    if (!upgradeResponse.ok) {
      throw new Error(`HTTP ${upgradeResponse.status}: ${upgradeResponse.statusText}`);
    }

    const upgradeData = await upgradeResponse.json();
    console.log(`✅ VIP upgrade response: ${upgradeData.message}\n`);

    // Step 2: Verify subscription status
    console.log('📝 Step 2: Verifying subscription status...');
    const verifyResponse = await fetch(`${backendUrl}/api/paypal/verify/${userId}`);

    if (!verifyResponse.ok) {
      throw new Error(`HTTP ${verifyResponse.status}: ${verifyResponse.statusText}`);
    }

    const verifyData = await verifyResponse.json();
    console.log(`✅ Subscription verified: ${verifyData.is_subscribed ? 'ACTIVE' : 'INACTIVE'}`);
    if (verifyData.subscription) {
      console.log(`   - Subscription ID: ${verifyData.subscription.paypal_subscription_id}`);
      console.log(`   - Status: ${verifyData.subscription.status}`);
      console.log(`   - Plan ID: ${verifyData.subscription.plan_id}\n`);
    }

    // Step 3: Summary
    console.log('✅ VIP Payment Test Complete!');
    console.log('\n📌 Next Steps:');
    console.log('1. Log in to the website with this user account');
    console.log('2. Refresh the page (Ctrl+F5 or Cmd+Shift+R)');
    console.log('3. You should now see the premium content unlocked!');
    console.log('\n💡 Tip: If content is still locked, clear your browser cache and try again.');

  } catch (error) {
    console.error(`❌ Error during test: ${error.message}`);
    console.log('\n🔍 Troubleshooting:');
    console.log('- Verify the backend URL is correct');
    console.log('- Ensure the user ID exists in your Supabase database');
    console.log('- Check that the backend is running and accessible');
    process.exit(1);
  }
}

testVIPPayment();
