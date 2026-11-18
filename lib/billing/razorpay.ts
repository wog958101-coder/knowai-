import Razorpay from 'razorpay';

const keyId = process.env.RAZORPAY_KEY_ID || '';
const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
const razorpayMode = process.env.RAZORPAY_MODE || 'test';

if (razorpayMode !== 'test' || (keyId && !keyId.startsWith('rzp_test_'))) {
  console.warn('WARNING: Razorpay is not configured in strict test mode.');
}

export const razorpay = new (Razorpay as any)({
  key_id: keyId || 'rzp_test_placeholder',
  key_secret: keySecret || 'placeholder_secret',
});
