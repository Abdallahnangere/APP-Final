# SaukiMart Android WebView + FCM Credit Alert Integration Guide

This guide explains how to run push notifications with this architecture:
- Native Android app owns Firebase SDK and receives notifications.
- SaukiMart web backend owns transaction events and sends targeted FCM pushes.

The goal is: credit alerts must still arrive even when the app is not open.

## 1. Final architecture

1. User logs into SaukiMart web app inside WebView.
2. Android app gets FCM token from Firebase Messaging.
3. Android app gets SaukiMart auth token from WebView localStorage (`sm_token`).
4. Android app calls backend endpoint `POST /api/push-token` with bearer token + FCM token.
5. Backend stores token in `user_push_tokens` table.
6. On wallet credit events, backend maps user -> active FCM token(s) and sends push.

Credit events wired on backend:
- Flutterwave deposit credit
- Transfer recipient credit
- Admin wallet credit

## 2. Backend status in this repo

Already implemented files:
- `lib/push.ts`: FCM HTTP v1 sender + message templates + invalid token deactivation
- `app/api/push-token/route.ts`: register/unregister token endpoints
- `app/api/webhooks/flutterwave/route.ts`: sends deposit credit alerts
- `app/api/user-transfer/route.ts`: sends transfer-in alerts
- `app/api/admin/wallet/route.ts`: sends admin credit alerts
- `lib/db.ts` and `NEON_INIT_SCRIPT.sql`: `user_push_tokens` table

## 3. Backend environment variables (server)

Set these in your web backend deployment (Vercel or server env):
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- optional `FIREBASE_TOKEN_URI` (defaults to Google OAuth token endpoint)

Notes:
- `FIREBASE_PRIVATE_KEY` must preserve line breaks. If stored with escaped newlines, code handles `\\n` conversion.
- Do not put these secrets in Android app.

## 4. Database setup

Run your existing DB init/migration flow so `user_push_tokens` exists.

Table used:
- `user_id`
- `token` (unique)
- `platform`
- `app_version`
- `is_active`
- `last_seen_at`

## 5. Firebase project setup (Android)

1. Open Firebase Console.
2. Use/create project for SaukiMart.
3. Add Android app package: `online.saukimart.twa`.
4. Download `google-services.json`.
5. Put file in Android module path: `app/google-services.json`.
6. Enable Firebase Cloud Messaging in project.
7. In Android app, create notification channel id: `credit_alerts`.

## 6. Android permissions and manifest

Add internet and notification permission:
- `android.permission.INTERNET`
- `android.permission.POST_NOTIFICATIONS` (Android 13+)

Request `POST_NOTIFICATIONS` at runtime on Android 13+.

Use this manifest baseline:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

  <application
    android:name=".SaukiMartApp"
    android:allowBackup="true"
    android:icon="@mipmap/ic_launcher"
    android:label="SaukiMart"
    android:roundIcon="@mipmap/ic_launcher_round"
    android:supportsRtl="true"
    android:theme="@style/Theme.SaukiMart">

    <activity
      android:name=".MainActivity"
      android:exported="true"
      android:launchMode="singleTask"
      android:windowSoftInputMode="adjustResize">
      <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
      </intent-filter>
    </activity>

    <service
      android:name=".push.SaukiMartFirebaseMessagingService"
      android:exported="false">
      <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
      </intent-filter>
    </service>

  </application>
</manifest>
```

## 7. Gradle and Firebase base setup

Project level `settings.gradle.kts` or root plugin config:

```kotlin
plugins {
  id("com.android.application") version "8.4.2" apply false
  id("org.jetbrains.kotlin.android") version "1.9.24" apply false
  id("com.google.gms.google-services") version "4.4.2" apply false
}
```

App module `build.gradle.kts`:

```kotlin
plugins {
  id("com.android.application")
  id("org.jetbrains.kotlin.android")
  id("com.google.gms.google-services")
}

android {
  namespace = "online.saukimart.twa"
  compileSdk = 35

  defaultConfig {
    applicationId = "online.saukimart.twa"
    minSdk = 26
    targetSdk = 35
    versionCode = 1
    versionName = "1.0.0"
  }
}

dependencies {
  implementation("androidx.core:core-ktx:1.13.1")
  implementation("androidx.activity:activity-compose:1.9.2")
  implementation("androidx.compose.ui:ui:1.6.8")
  implementation("androidx.compose.material3:material3:1.2.1")
  implementation("com.google.firebase:firebase-messaging-ktx:24.0.1")
  implementation("com.squareup.okhttp3:okhttp:4.12.0")
}
```

Then place `google-services.json` in `app/google-services.json`.

## 8. Android token registration flow

Implement this logic in native app:

1. On app start and on FCM token refresh:
- fetch FCM token from Firebase Messaging SDK.

2. On WebView page load completion:
- evaluate JavaScript to get SaukiMart token from localStorage key `sm_token`.
- if token exists, call backend:
  - `POST https://saukimart.online/api/push-token`
  - header `Authorization: Bearer <sm_token>`
  - body:
    ```json
    {
      "token": "<fcm_token>",
      "platform": "android",
      "appVersion": "1.0.0"
    }
    ```

3. Repeat registration when any of these changes:
- FCM token changed
- user login changed
- app resumed after long idle period (safe re-sync)

4. On logout:
- call `DELETE https://saukimart.online/api/push-token`
- same bearer token
- optional body `{ "token": "<fcm_token>" }`

## 9. Kotlin implementation blocks

### 9.1 App class and notification channel

Create `SaukiMartApp.kt`:

```kotlin
package online.saukimart.twa

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build

class SaukiMartApp : Application() {
  override fun onCreate() {
    super.onCreate()
    createCreditAlertsChannel()
  }

  private fun createCreditAlertsChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

    val channel = NotificationChannel(
      "credit_alerts",
      "Credit Alerts",
      NotificationManager.IMPORTANCE_HIGH
    ).apply {
      description = "Wallet credit and transfer alerts"
      enableVibration(true)
    }

    val nm = getSystemService(NotificationManager::class.java)
    nm.createNotificationChannel(channel)
  }
}
```

### 9.2 Token storage helper

Create `push/FcmTokenStore.kt`:

```kotlin
package online.saukimart.twa.push

import android.content.Context

class FcmTokenStore(context: Context) {
  private val prefs = context.getSharedPreferences("sm_push", Context.MODE_PRIVATE)

  fun saveFcmToken(token: String) {
    prefs.edit().putString("fcm_token", token).apply()
  }

  fun getFcmToken(): String? = prefs.getString("fcm_token", null)

  fun saveWebAuthToken(token: String?) {
    prefs.edit().putString("web_auth_token", token).apply()
  }

  fun getWebAuthToken(): String? = prefs.getString("web_auth_token", null)

  fun saveLastSyncedPair(pair: String) {
    prefs.edit().putString("last_synced_pair", pair).apply()
  }

  fun getLastSyncedPair(): String? = prefs.getString("last_synced_pair", null)
}
```

### 9.3 Push API client

Create `push/PushApiClient.kt`:

```kotlin
package online.saukimart.twa.push

import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

class PushApiClient {
  private val client = OkHttpClient()
  private val jsonMedia = "application/json; charset=utf-8".toMediaType()

  fun registerToken(baseUrl: String, webAuthToken: String, fcmToken: String, appVersion: String) {
    val payload = """
      {"token":"$fcmToken","platform":"android","appVersion":"$appVersion"}
    """.trimIndent()

    val request = Request.Builder()
      .url("$baseUrl/api/push-token")
      .addHeader("Authorization", "Bearer $webAuthToken")
      .post(payload.toRequestBody(jsonMedia))
      .build()

    client.newCall(request).execute().use { response ->
      if (!response.isSuccessful) {
        throw IllegalStateException("Push token register failed: ${response.code}")
      }
    }
  }

  fun deactivateToken(baseUrl: String, webAuthToken: String, fcmToken: String?) {
    val payload = if (fcmToken.isNullOrBlank()) "{}" else "{\"token\":\"$fcmToken\"}"

    val request = Request.Builder()
      .url("$baseUrl/api/push-token")
      .addHeader("Authorization", "Bearer $webAuthToken")
      .delete(payload.toRequestBody(jsonMedia))
      .build()

    client.newCall(request).execute().close()
  }
}
```

### 9.4 TokenSyncManager

Create `push/TokenSyncManager.kt`:

```kotlin
package online.saukimart.twa.push

import android.content.Context
import android.os.Build
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class TokenSyncManager(
  context: Context,
  private val baseUrl: String = "https://saukimart.online",
  private val appVersion: String = "1.0.0"
) {
  private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
  private val store = FcmTokenStore(context.applicationContext)
  private val api = PushApiClient()

  fun onFcmTokenAvailable(token: String) {
    store.saveFcmToken(token)
    syncIfReady()
  }

  fun onWebAuthTokenAvailable(token: String?) {
    store.saveWebAuthToken(token)
    syncIfReady()
  }

  fun onLogout() {
    val auth = store.getWebAuthToken()
    val fcm = store.getFcmToken()
    if (auth.isNullOrBlank()) return

    scope.launch {
      runCatching { api.deactivateToken(baseUrl, auth, fcm) }
    }
  }

  private fun syncIfReady() {
    val auth = store.getWebAuthToken()
    val fcm = store.getFcmToken()
    if (auth.isNullOrBlank() || fcm.isNullOrBlank()) return

    val pair = "$auth|$fcm"
    if (pair == store.getLastSyncedPair()) return

    scope.launch {
      runCatching {
        api.registerToken(baseUrl, auth, fcm, appVersion)
        store.saveLastSyncedPair(pair)
      }
    }
  }
}
```

### 9.5 FirebaseMessagingService

Create `push/SaukiMartFirebaseMessagingService.kt`:

```kotlin
package online.saukimart.twa.push

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import online.saukimart.twa.MainActivity
import online.saukimart.twa.R

class SaukiMartFirebaseMessagingService : FirebaseMessagingService() {

  private val syncManager by lazy { TokenSyncManager(applicationContext) }

  override fun onNewToken(token: String) {
    super.onNewToken(token)
    syncManager.onFcmTokenAvailable(token)
  }

  override fun onMessageReceived(message: RemoteMessage) {
    super.onMessageReceived(message)

    val title = message.notification?.title
      ?: if (message.data["type"] == "credit_alert") "Wallet Alert" else "SaukiMart"

    val body = message.notification?.body
      ?: "You have a new account update"

    val intent = Intent(this, MainActivity::class.java).apply {
      flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
      putExtra("open_screen", "transactions")
      putExtra("push_type", message.data["type"] ?: "")
    }

    val pendingIntent = PendingIntent.getActivity(
      this,
      5001,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    val notification = NotificationCompat.Builder(this, "credit_alerts")
      .setSmallIcon(R.drawable.ic_notification)
      .setContentTitle(title)
      .setContentText(body)
      .setStyle(NotificationCompat.BigTextStyle().bigText(body))
      .setPriority(NotificationCompat.PRIORITY_HIGH)
      .setAutoCancel(true)
      .setContentIntent(pendingIntent)
      .build()

    NotificationManagerCompat.from(this).notify(System.currentTimeMillis().toInt(), notification)
  }
}
```

### 9.6 WebView token extractor

Create `web/WebAuthTokenExtractor.kt`:

```kotlin
package online.saukimart.twa.web

import android.webkit.ValueCallback
import android.webkit.WebView

class WebAuthTokenExtractor {
  fun extract(webView: WebView, onToken: (String?) -> Unit) {
    webView.evaluateJavascript("""(() => localStorage.getItem('sm_token') || '')();""") { raw ->
      val cleaned = raw
        ?.trim()
        ?.removePrefix("\"")
        ?.removeSuffix("\"")
        ?.replace("\\\\\"", "\"")
        ?.ifBlank { null }
      onToken(cleaned)
    }
  }
}
```

### 9.7 MainActivity wiring sample

In your WebView host activity:

```kotlin
private val tokenSyncManager by lazy { TokenSyncManager(this, "https://saukimart.online", BuildConfig.VERSION_NAME) }
private val tokenExtractor = WebAuthTokenExtractor()

private fun setupFcmBootstrap() {
  FirebaseMessaging.getInstance().token.addOnSuccessListener { token ->
    if (!token.isNullOrBlank()) {
      tokenSyncManager.onFcmTokenAvailable(token)
    }
  }
}

private fun setupWebViewTokenSync(webView: WebView) {
  webView.webViewClient = object : WebViewClient() {
    override fun onPageFinished(view: WebView?, url: String?) {
      super.onPageFinished(view, url)
      if (view != null && url?.startsWith("https://saukimart.online") == true) {
        tokenExtractor.extract(view) { webAuthToken ->
          tokenSyncManager.onWebAuthTokenAvailable(webAuthToken)
        }
      }
    }
  }
}

override fun onResume() {
  super.onResume()
  webView?.let { v -> tokenExtractor.extract(v) { tokenSyncManager.onWebAuthTokenAvailable(it) } }
}
```

## 10. How to read web auth token from WebView

Recommended approach:

1. After `onPageFinished`, run:
```javascript
(() => localStorage.getItem('sm_token') || '')();
```
2. Parse callback value in Android.
3. If non-empty, register FCM token with backend.

Important:
- This works only when WebView is on SaukiMart domain.
- Re-run after navigation to ensure token is captured after login.

## 11. Notification payload shape used by backend

Backend sends:
- Notification title/body for user-visible alert
- Data payload fields:
  - `type=credit_alert`
  - `kind=deposit|transfer_in|admin_credit|admin_cashback_credit`
  - `amount`
  - `newBalance`
  - `reference`

Android should handle both:
- foreground messages
- background notification tap routing

For app-closed delivery, backend must include a `notification` object in the FCM payload (already done in this repo), so Android system tray can display it when app process is dead.

## 12. Make sure push works when app is closed

Use all of these rules together:

1. Backend sends FCM with:
- `message.notification.title`
- `message.notification.body`
- `android.priority = high`
- `android.notification.channel_id = credit_alerts`

2. Android app creates channel id `credit_alerts` on startup.
3. User grants notification permission on Android 13+.
4. Device token is synced to backend via `POST /api/push-token`.
5. Do not force-stop app from system settings while testing; force-stop can block background delivery until user opens app again.

Result:
- If app is closed normally (swiped away), credit alerts still appear in notification tray.
- If app is foregrounded, `onMessageReceived` can show custom local notification UI.

## 13. End-to-end test checklist

1. Register/login in WebView.
2. Confirm `POST /api/push-token` returns success.
3. Trigger each event:
- bank deposit webhook
- user transfer to recipient
- admin credit in admin panel
4. Confirm device receives push for credited user.
5. Logout and ensure token deactivation path works.
6. Re-login and ensure token re-activation works.

## 14. Troubleshooting

No push received:
1. Check backend env vars are set correctly.
2. Verify token exists and active in `user_push_tokens`.
3. Verify user has `notifications_enabled = true`.
4. Confirm Android notification permission granted.
5. Confirm channel id `credit_alerts` exists.
6. Check backend logs for FCM errors (`UNREGISTERED`, `INVALID_ARGUMENT`).

Wrong user receives push:
1. Ensure app registers token only after extracting current `sm_token`.
2. Ensure logout deactivates old token.
3. Ensure token refresh re-registers with current session.

## 15. Production hardening recommendations

1. Keep push sending non-blocking, never fail money transaction on push failure.
2. Keep max tokens per user small (already limited in sender query).
3. Monitor FCM error rates in logs.
4. Add admin dashboard metric for active push tokens per user.
5. Add periodic cleanup of inactive tokens older than 90 days.

## 16. Back button navigation (Android)

The app uses browser history to manage screen navigation. When user presses the device back button, they should go to the previous screen in the app instead of exiting.

**Frontend support:** Web app now tracks screen history in JavaScript and responds to `goBack()` calls.

**Android implementation:**

Override `onBackPressed()` in MainActivity to navigate back within the app:

```kotlin
override fun onBackPressed() {
  // Try to go back in WebView history first
  if (webView?.canGoBack() == true) {
    webView?.goBack()
  } else {
    // No more WebView history, go back in app screens
    webView?.evaluateJavascript("javascript:window.__goBack?.();", null)
    // If JavaScript callback not available, exit app
    super.onBackPressed()
  }
}
```

**Or use WebViewClient callback for cleaner handling:**

```kotlin
private class SaukiMartWebViewClient : WebViewClient() {
  override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
    super.onPageStarted(view, url, favicon)
    // Inject goBack function into window object
    view?.evaluateJavascript("""
      window.__goBack = function() {
        if (window.__screenHistory && window.__screenHistory.length > 0) {
          // Backend screen navigation
          fetch('/api/navigate-back', { method: 'POST' }).catch(() => {});
        }
      };
    """.trimIndent(), null)
  }
}
```

**Simpler approach - add to WebView setup:**

```kotlin
webView?.apply {
  evaluateJavascript("""
    let screenStack = [];
    const originalSetScreen = window.setScreen;
  """, null)
}

// In MainActivity.onBackPressed():
override fun onBackPressed() {
  webView?.evaluateJavascript("history.back()", null)
  // This triggers the popstate event, which calls goBack() in the web app
}
```

**Best practice:** The web app now automatically handles back button via the `popstate` event listener. Simply override `onBackPressed()` to call `webView.goBack()` or `history.back()`:

```kotlin
override fun onBackPressed() {
  if (webView?.canGoBack() == true) {
    webView?.goBack()
  } else {
    super.onBackPressed()  // Exit app if no history
  }
}
```

This ensures:
- Last page navigates to previous screen in app
- Once at root (home), tapping back again exits app
- UX matches native Android apps
