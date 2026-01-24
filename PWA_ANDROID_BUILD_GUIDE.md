# PWA Android Build Configuration Guide

## Overview
This guide explains how to build and deploy SAUKI MART as a PWA with Android Studio integration. The app is now fully optimized for mobile platforms with support for push notifications, offline functionality, and native-like experience.

## PWA Capabilities Implemented

### ✅ Push Notifications
- **Targeting System**: Send to All Users, Agents Only, or Customers Only
- **Admin Dashboard**: Full control panel for notification campaigns
- **Service Worker**: Automatic push subscription management
- **Location**: `/app/api/admin/push/route.ts`

### ✅ Offline Support
- Service worker caching strategy
- App shell architecture
- Fallback pages for offline mode
- Location: `/public/sw.js`

### ✅ Home Screen Installation
- One-click install from browser
- Standalone mode (no address bar)
- Custom splash screens
- App icons for all sizes (72x72 to 512x512)

### ✅ Platform Integration
- File handling for images
- Protocol handlers
- Share target API
- Deep linking support

## Manifest Configuration

The `manifest.json` has been optimized with:
- Complete icon set (regular + maskable)
- Android display settings
- App shortcuts for quick access
- Screenshot previews
- Related applications (Play Store link)

## Building for Android

### Method 1: Using Trusted Web Activity (TWA)
TWA allows you to package a PWA as a native Android app using Bubblewrap CLI.

```bash
# Install Bubblewrap
npm install -g @bubblewrap/cli

# Initialize new TWA project
bubblewrap init --manifest https://www.saukimart.online/manifest.json

# Build signed APK
bubblewrap build

# Output: app-release.apk (ready for Play Store)
```

### Method 2: Using Android Studio + Gradle
1. Create new Android Native project
2. Add WebView component
3. Point to https://www.saukimart.online
4. Configure manifest permissions:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### Method 3: Using App Wrapper Services
Services like:
- **PWABuilder** (Microsoft)
- **Web2App**
- **AppsGeyser**

These automatically convert PWA manifest to native app with play store submission support.

## Required Icons

All icons should be placed in `/public/icons/`:

```
icon-72x72.png          (Android notification icon)
icon-96x96.png          (Android app icon)
icon-128x128.png        (Device home screen)
icon-144x144.png        (Android tablet)
icon-152x152.png        (iPad mini)
icon-192x192.png        (Android home screen - PRIMARY)
icon-384x384.png        (iPad)
icon-512x512.png        (Splash screen / Play Store)

icon-maskable-*.png     (Alternative icons for masking)
```

### Maskable Icons
Android 13+ uses maskable icons for better visual consistency:
- Safe zone: center 66% of icon
- Transparent background required
- Used for themed icons based on system colors

## Service Worker Enhancements

Located at `/public/sw.js`, it handles:
- **Cache Strategy**: Stale-while-revalidate
- **Push Events**: Notification listeners
- **Background Sync**: Offline transaction queueing
- **Periodic Sync**: Daily notification checks

## API Integration

### Push Notification Endpoint
**POST** `/api/admin/push`

```json
{
  "title": "Special Offer",
  "body": "Get 10% off on all data plans",
  "targetType": "all|agents|users",
  "password": "admin_password"
}
```

Response targets subscriptions based on type:
- `all`: All push subscriptions
- `agents`: Only agent phone numbers
- `users`: Only customer phone numbers

### Push Subscription
**POST** `/api/push-subscribe`

Automatically subscribes device to push notifications.

## Testing Locally

```bash
# Start development server
npm run dev

# Visit https://localhost:3000
# Install app using browser menu (three dots > Install app)
# Test push notifications in admin panel
```

## Play Store Submission

### Requirements
1. ✅ App name: "SAUKI MART"
2. ✅ Icon: 512x512 PNG in `/public/icons/`
3. ✅ Screenshots: 2-5 screenshots in `/public/screenshots/`
4. ✅ Description: Updated in manifest.json
5. ✅ Privacy policy: https://www.saukimart.online/privacy
6. ✅ Terms of service: Include in app

### Submission Checklist
- [ ] APK signed with release key
- [ ] Version code incremented
- [ ] All icons present and correct size
- [ ] Screenshots in correct aspect ratio (9:16)
- [ ] Privacy policy URL verified
- [ ] Push notification permissions explained
- [ ] App tested on Android 8+
- [ ] Manifest valid (use https://web.dev/manifest-validator/)

## Verifying PWA Quality

Use Google's Lighthouse tool:
```bash
# Run Lighthouse audit
npx lighthouse https://www.saukimart.online --view
```

Should score:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100+
- PWA: 100+

## Optimization Tips

1. **Reduce Bundle Size**
   - Code splitting enabled in Next.js
   - Tree-shaking configured in build
   - Image optimization via next/image

2. **Faster Load Times**
   - Service worker caching
   - Stale-while-revalidate strategy
   - Prefetch critical resources

3. **Better UX**
   - Smooth animations with Framer Motion
   - Toast notifications for feedback
   - Deep linking support
   - Offline fallback pages

## Network Requirements

### For Development
- HTTPS required for service workers
- localhost accepted for testing
- VAPID keys configured for push

### For Production
- Valid SSL certificate (Let's Encrypt free)
- CORS headers configured
- Push notification service accessible
- All assets cacheable

## Troubleshooting

### App not installing
- Check manifest.json validity
- Ensure icons exist and are correct size
- Verify HTTPS is enabled
- Clear browser cache and try again

### Push notifications not working
- Check VAPID keys in .env
- Verify service worker registration
- Ensure user granted notification permission
- Check admin API endpoint accessibility

### Offline mode issues
- Verify service worker installed
- Check cache storage quota
- Ensure critical assets cached
- Review cache-first strategy in sw.js

## File Structure for Android Build

```
/workspaces/APP-Final/
├── public/
│   ├── manifest.json          ← Main config
│   ├── sw.js                  ← Service worker
│   ├── icons/                 ← All icon sizes
│   ├── screenshots/           ← Play Store images
│   └── robots.txt
├── app/
│   ├── layout.tsx             ← Meta tags optimized
│   ├── globals.css            ← Safe area CSS
│   └── api/admin/push/        ← Push API
└── next.config.mjs            ← PWA plugin configured
```

## Next Steps

1. ✅ Validate manifest.json: `https://web.dev/manifest-validator/`
2. ✅ Test PWA locally: `npm run dev`
3. ✅ Run Lighthouse audit
4. ✅ Build for Android using Bubblewrap
5. ✅ Sign APK with release certificate
6. ✅ Submit to Play Store

## References

- MDN PWA Docs: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
- Web.dev PWA: https://web.dev/progressive-web-apps/
- Android TWA Guide: https://developer.chrome.com/docs/android/trusted-web-activity/
- Bubblewrap CLI: https://github.com/GoogleChromeLabs/bubblewrap
- Play Store Guidelines: https://play.google.com/console/

## Support

For issues:
1. Check the troubleshooting section above
2. Review browser console for errors
3. Check service worker in DevTools > Application
4. Verify manifest.json is served with correct MIME type
5. Contact: saukidatalinks@gmail.com
