import webpush from 'web-push';

// Generate VAPID keys for web push
const vapidKeys = webpush.generateVAPIDKeys();

console.log('🔑 Generated VAPID Keys:');
console.log('');
console.log('PUBLIC KEY (for .env.local):');
console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('');
console.log('PRIVATE KEY (for .env.local):');
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('');
console.log('Also add these to your .env.local:');
console.log('VAPID_EMAIL=admin@saukimart.com (or your email)');
console.log('ADMIN_PASSWORD=your_admin_password');
