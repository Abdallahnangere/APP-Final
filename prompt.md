# SaukiMart Android Native WebView Wrapper Prompt (with FCM Credit Alerts)

Build a production-quality native Android app in Android Studio that wraps the SaukiMart web app in a polished, reliable WebView shell and integrates Firebase Cloud Messaging token sync with the SaukiMart backend.

Core target
- App name: SaukiMart
- Package name: `online.saukimart.twa`
- Language: Kotlin
- UI approach: native Android with Jetpack Compose for shell UI, but use Android `WebView` for rendering the site
- Start URL: `https://saukimart.online/app`
- Min SDK: 26+
- Target latest stable Android SDK

Primary goal
- Create a brilliant native wrapper around the SaukiMart web app that feels premium and fully production-ready, not a basic demo WebView.

Architecture constraints
- Native app owns Firebase SDK setup, notification channels, token refresh handling, and notification rendering behavior.
- Web backend owns transaction/business events and sends push notifications based on mapped user tokens.
- Native app must register FCM token to backend endpoint after login/session detection from WebView.

Functional requirements
- Load `https://saukimart.online/app` on launch.
- Keep users logged in across app restarts with proper cookie/session persistence.
- Support JavaScript, DOM storage, local storage, session storage, cookies, and modern web APIs commonly used in mobile web apps.
- Handle navigation correctly:
  - Android back button should go back inside WebView history first.
  - If there is no WebView history, exit app or move task to background gracefully.
- Show a polished loading state with progress bar and branded splash/loading treatment.
- Support pull-to-refresh.
- Detect offline state and show a native retry/offline view.
- Support downloads from the web app, including images, PDFs, receipt PNGs, CSVs, and other downloadable files.
- Use Android `DownloadManager` for normal file URLs.
- Support blob/data/download edge cases if the website triggers downloads from generated content.
- After download completes, show a notification/toast and allow opening the downloaded file.
- Support file uploads from the website:
  - `<input type="file">`
  - camera capture
  - image picker / document picker
- Request only minimum required permissions using modern Android permission patterns.
- Support external intents for:
  - `tel:` links
  - `mailto:` links
  - WhatsApp or other external deep links
  - Play Store links
  - Maps links
- Open only SaukiMart pages inside WebView; open clearly external domains with intents or Chrome Custom Tabs.
- Handle SSL errors safely: do not bypass SSL validation insecurely.
- Support dark status bar and edge-to-edge layout cleanly.
- Prevent accidental white flashes between transitions.

Firebase messaging requirements
- Integrate Firebase Messaging in Android app using `google-services.json`.
- Create notification channel id `credit_alerts`.
- Request runtime `POST_NOTIFICATIONS` permission for Android 13+.
- Implement a `FirebaseMessagingService` to handle:
  - token refresh (`onNewToken`)
  - foreground message handling
  - notification tap routing to app
- Backend endpoint for token registration:
  - `POST https://saukimart.online/api/push-token`
  - Header: `Authorization: Bearer <sm_token>`
  - Body: `{ "token": "<fcm_token>", "platform": "android", "appVersion": "<app_version>" }`
- Backend endpoint for token deactivation on logout:
  - `DELETE https://saukimart.online/api/push-token`
  - Header: `Authorization: Bearer <sm_token>`
  - Optional Body: `{ "token": "<fcm_token>" }`

WebView-token bridge requirements
- App must read SaukiMart auth token from WebView localStorage key `sm_token`.
- Use `evaluateJavascript` after page load to fetch token:
  - `(() => localStorage.getItem('sm_token') || '')();`
- Build a `SessionBridgeManager` that stores latest web auth token and FCM token and syncs whenever either changes.
- Re-sync token registration on:
  - app start
  - page finished
  - FCM token refresh
  - app resume
- Avoid duplicate API calls with simple in-memory/cache dedupe.

Quality requirements
- Use clean architecture with separated classes/components for:
  - Main activity
  - WebView configuration
  - File chooser support
  - Download handling
  - Network monitoring
  - External link handling
  - Firebase messaging manager
  - Session/token sync manager
  - Push API client
- Include strong lifecycle handling so WebView is not recreated unnecessarily.
- Avoid memory leaks.
- Handle configuration changes sensibly.
- Use modern Android best practices.
- Add concise comments only where useful.

UX requirements
- Make app feel premium, fintech-grade, and polished.
- Use SaukiMart branding colors and refined splash/loading experience.
- Include subtle native polish:
  - progress indicator while pages load
  - retry action on failures
  - smooth transitions
  - user-friendly download confirmations

Security requirements
- Restrict WebView navigation to trusted SaukiMart domains by default.
- Disable unsafe debugging behavior in release builds.
- Do not hardcode secrets.
- Use safe WebView settings.
- Do not expose Firebase server credentials in app.

Implementation details I want from you
- Generate complete Android Studio project code.
- Include:
  - `MainActivity.kt`
  - helper classes
  - `AndroidManifest.xml`
  - Gradle dependencies
  - Compose UI files if used
  - `WebChromeClient` and `WebViewClient` implementations
  - download receiver/callback handling
  - file chooser implementation
  - runtime permission flow
  - `FirebaseMessagingService`
  - push token API client
  - web session token extractor and sync manager
- Explain where each file belongs.
- Ensure code compiles in recent stable Android Studio.

Important behavior details
- SaukiMart web app can generate receipts for download, so download handling must be reliable.
- Web app uses authenticated sessions and local storage, so persistence must be solid.
- Wrapper must be robust enough for production Play Store deployment.

Expected output format
- First give project structure.
- Then provide each file in full.
- Then provide setup steps.
- Then provide release-build notes and Play Store checklist.
- Then provide a test plan that verifies:
  - token registration success
  - token refresh path
  - logout token deactivation
  - credit alert receipt for deposit, transfer-in, and admin credit.