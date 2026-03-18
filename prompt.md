# SaukiMart Android Native WebView Wrapper Prompt

Build a production-quality native Android app in Android Studio that wraps the SaukiMart web app in a polished, reliable WebView shell.

Core target
- App name: SaukiMart
- Package name: `online.saukimart.app`
- Language: Kotlin
- UI approach: native Android with Jetpack Compose for shell UI, but use Android `WebView` for rendering the site
- Start URL: `https://www.saukimart.online/app/app`
- Min SDK: 26+
- Target latest stable Android SDK

Primary goal
- Create a brilliant native wrapper around the SaukiMart web app that feels premium and fully production-ready, not a basic demo WebView.

Functional requirements
- Load `https://www.saukimart.online/app/app` on launch.
- Keep users logged in across app restarts with proper cookie/session persistence.
- Support JavaScript, DOM storage, local storage, session storage, cookies, and modern web APIs commonly used in mobile web apps.
- Handle navigation correctly:
  - Android back button should go back inside WebView history first.
  - If there is no WebView history, exit the app or move task to background gracefully.
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
- Request only the minimum required permissions, using modern Android permission patterns.
- Support external intents for:
  - `tel:` links
  - `mailto:` links
  - WhatsApp or other external deep links
  - Play Store links
  - Maps links
- Open only SaukiMart pages inside the WebView; open clearly external domains with Android intents or Chrome Custom Tabs.
- Handle SSL errors safely: do not bypass SSL validation insecurely.
- Support dark status bar / edge-to-edge layout cleanly.
- Prevent accidental white flashes between screen transitions.

Quality requirements
- Use a clean architecture with separated classes for:
  - Main activity
  - WebView configuration
  - File chooser support
  - Download handling
  - Network monitoring
  - External link handling
- Include strong lifecycle handling so the WebView is not recreated unnecessarily.
- Avoid memory leaks.
- Handle configuration changes sensibly.
- Use modern Android best practices.
- Add concise comments only where truly useful.

UX requirements
- Make the app feel premium, fintech-grade, and polished.
- Use SaukiMart branding colors and a refined splash/loading experience.
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

Implementation details I want from you
- Generate the complete Android Studio project code.
- Include:
  - `MainActivity.kt`
  - any helper classes
  - `AndroidManifest.xml`
  - Gradle dependencies
  - Compose UI files if used
  - WebChromeClient and WebViewClient implementations
  - download receiver or callback handling
  - file chooser implementation
  - runtime permission flow
- Explain where each file belongs.
- Ensure the code compiles in a recent stable Android Studio version.

Important behavior details
- The SaukiMart web app can generate receipts for download, so download handling must work reliably.
- The web app may use authenticated sessions and local storage, so persistence must be solid.
- The wrapper should be robust enough for production Play Store deployment.

Expected output format
- First give the project structure.
- Then provide each file in full.
- Then provide setup steps.
- Then provide release-build notes and anything needed before Play Store submission.