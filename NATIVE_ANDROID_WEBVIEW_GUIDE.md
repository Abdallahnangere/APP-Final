# Complete Native Android WebView App - Full Build Guide

## 📱 Project Overview

This guide provides step-by-step instructions to build a **true native Android APK** that loads your website using Android's WebView. Unlike PWAs, this creates a genuine native application with full access to Android features, direct Google Play Store publishing, and no Chrome badge or PWA splash screens.

**Key Differences from PWA:**
- ✅ True native Android app
- ✅ Direct Google Play Store distribution
- ✅ Full native features integration
- ✅ No Chrome badge or PWA indicators
- ✅ Custom splash screens
- ✅ Native Android navigation
- ✅ Offline capabilities with caching
- ✅ Push notifications via Firebase
- ✅ Camera, contacts, geolocation access

---

## 🛠️ Part 1: Prerequisites & Setup

### System Requirements
- **Android Studio** (latest version) - [Download](https://developer.android.com/studio)
- **Java Development Kit (JDK)** 11 or higher
- **Android SDK** 24+ (API level)
- **Android Virtual Device (AVD)** or physical device for testing
- **Gradle** (bundled with Android Studio)
- **Git** (for version control)

### Installation Steps

#### 1. Install Android Studio
```bash
# On Mac
brew install android-studio

# On Linux
wget https://redirector.gvt1.com/edgedl/android/studio/ide-zips/2024.1.1/android-studio-2024.1.1-linux.tar.gz
tar -xzf android-studio-*.tar.gz
./android-studio/bin/studio.sh
```

#### 2. Configure Android SDK
- Open Android Studio
- Navigate to: **Tools** → **SDK Manager**
- Install:
  - Android SDK Platform (API 34 recommended)
  - Android SDK Build-Tools
  - Google Play services
  - Android Emulator

#### 3. Create Android Virtual Device (AVD)
- Tools → Device Manager → Create Virtual Device
- Select: Pixel 5 (or preferred device)
- Select: Android 14 (API 34) or higher
- Allocate: 4GB RAM, 2GB storage

#### 4. Install Java JDK
```bash
# macOS
brew install openjdk@11

# Ubuntu/Debian
sudo apt-get install openjdk-11-jdk

# Windows
# Download from: https://adoptopenjdk.net/
```

---

## 📦 Part 2: Creating the Android Project

### Step 1: Create New Project
1. Open Android Studio
2. Click **File** → **New** → **New Project**
3. Select **Empty Activity**
4. Configure:
   - **Name:** SaukiMartApp
   - **Package name:** com.saukiland.saukimart
   - **Save location:** Choose your workspace
   - **Language:** Kotlin (recommended) or Java
   - **Minimum SDK:** API 24 (Android 7.0)
   - **Target SDK:** API 34 (Android 14)

### Step 2: Project Structure
```
SaukiMartApp/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/saukiland/saukimart/
│   │   │   │   ├── MainActivity.kt
│   │   │   │   ├── SplashActivity.kt
│   │   │   │   ├── WebViewClient.kt
│   │   │   │   ├── FirebaseMessagingService.kt
│   │   │   │   └── utils/
│   │   │   │       ├── WebViewUtils.kt
│   │   │   │       ├── CacheManager.kt
│   │   │   │       └── DeepLinkHandler.kt
│   │   │   ├── res/
│   │   │   │   ├── drawable/
│   │   │   │   ├── mipmap/
│   │   │   │   ├── layout/
│   │   │   │   ├── values/
│   │   │   │   └── raw/
│   │   │   └── AndroidManifest.xml
│   │   └── assets/
│   ├── build.gradle.kts
│   └── proguard-rules.pro
├── gradle/
├── build.gradle.kts
├── settings.gradle.kts
└── local.properties
```

---

## 📄 Part 3: Core Implementation

### Step 1: Update `AndroidManifest.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- Internet Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Location Permissions -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <!-- Camera & Microphone -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />

    <!-- Storage -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

    <!-- Notifications -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <!-- Contacts -->
    <uses-permission android:name="android.permission.READ_CONTACTS" />

    <!-- Hardware Features -->
    <uses-feature
        android:name="android.hardware.camera"
        android:required="false" />
    <uses-feature
        android:name="android.hardware.location.gps"
        android:required="false" />

    <application
        android:allowBackup="true"
        android:debuggable="false"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.SaukiMartApp">

        <!-- Splash Activity -->
        <activity
            android:name=".SplashActivity"
            android:exported="true"
            android:theme="@style/SplashTheme">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Deep Link Support -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data
                    android:scheme="https"
                    android:host="yourdomain.com" />
            </intent-filter>
        </activity>

        <!-- Main Activity -->
        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:exported="false"
            android:hardwareAccelerated="true"
            android:theme="@style/Theme.SaukiMartApp" />

        <!-- Firebase Messaging Service -->
        <service
            android:name=".FirebaseMessagingService"
            android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT" />
            </intent-filter>
        </service>

    </application>

</manifest>
```

### Step 2: Configure `build.gradle.kts` (Module: app)

```kotlin
plugins {
    id("com.android.application")
    id("kotlin-android")
    id("com.google.gms.google-services")
}

android {
    namespace = "com.saukiland.saukimart"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.saukiland.saukimart"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "2.6.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        
        // WebView user agent
        manifestPlaceholders["WEBSITE_URL"] = "https://yourdomain.com"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("release")
        }
        debug {
            isMinifyEnabled = false
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    kotlinOptions {
        jvmTarget = "11"
    }

    buildFeatures {
        viewBinding = true
    }

    signingConfigs {
        create("release") {
            storeFile = file(System.getenv("KEYSTORE_PATH") ?: "keystore.jks")
            storePassword = System.getenv("KEYSTORE_PASSWORD")
            keyAlias = System.getenv("KEY_ALIAS")
            keyPassword = System.getenv("KEY_PASSWORD")
        }
    }
}

dependencies {
    // Core
    implementation("androidx.core:core:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.6.2")

    // WebView
    implementation("androidx.webkit:webkit:1.8.0")

    // Firebase
    implementation(platform("com.google.firebase:firebase-bom:32.7.0"))
    implementation("com.google.firebase:firebase-messaging-ktx")
    implementation("com.google.firebase:firebase-analytics-ktx")

    // Network
    implementation("com.squareup.okhttp3:okhttp:4.11.0")
    implementation("com.squareup.retrofit2:retrofit:2.10.0")

    // JSON
    implementation("com.google.code.gson:gson:2.10.1")

    // Image Loading
    implementation("com.bumptech.glide:glide:4.16.0")

    // Material Design
    implementation("com.google.android.material:material:1.11.0")

    // Testing
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
}
```

### Step 3: Create `SplashActivity.kt`

```kotlin
package com.saukiland.saukimart

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.appcompat.app.AppCompatActivity
import com.saukiland.saukimart.databinding.ActivitySplashBinding

class SplashActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySplashBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySplashBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Hide status bar for immersive splash
        window.decorView.systemUiVisibility = (
            android.view.View.SYSTEM_UI_FLAG_FULLSCREEN or
            android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        )

        // Display splash for 2-3 seconds
        Handler(Looper.getMainLooper()).postDelayed({
            startActivity(Intent(this, MainActivity::class.java))
            finish()
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
        }, 2500)
    }
}
```

### Step 4: Create Main `MainActivity.kt`

```kotlin
package com.saukiland.saukimart

import android.Manifest
import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.view.KeyEvent
import android.view.View
import android.webkit.*
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.webkit.WebSettingsCompat
import androidx.webkit.WebViewFeature
import com.saukiland.saukimart.databinding.ActivityMainBinding
import com.saukiland.saukimart.utils.WebViewUtils
import java.io.File
import java.net.URLDecoder

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private val WEBSITE_URL = "https://yourdomain.com"
    private val PERMISSION_REQUESTS = arrayOf(
        Manifest.permission.INTERNET,
        Manifest.permission.ACCESS_FINE_LOCATION,
        Manifest.permission.CAMERA,
        Manifest.permission.RECORD_AUDIO,
        Manifest.permission.READ_EXTERNAL_STORAGE,
        Manifest.permission.WRITE_EXTERNAL_STORAGE
    )
    private val PERMISSION_REQUEST_CODE = 100
    private val FILE_CHOOSER_REQUEST_CODE = 200
    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private var uploadMessage: ValueCallback<Uri>? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Request permissions
        requestRequiredPermissions()

        // Initialize WebView
        initializeWebView()

        // Setup progress bar
        setupProgressBar()

        // Load website
        loadWebsite()

        // Handle deep links
        handleDeepLink(intent)
    }

    private fun requestRequiredPermissions() {
        val permissionsNeeded = mutableListOf<String>()
        
        for (permission in PERMISSION_REQUESTS) {
            if (ContextCompat.checkSelfPermission(this, permission)
                != PackageManager.PERMISSION_GRANTED
            ) {
                permissionsNeeded.add(permission)
            }
        }

        if (permissionsNeeded.isNotEmpty()) {
            ActivityCompat.requestPermissions(
                this,
                permissionsNeeded.toTypedArray(),
                PERMISSION_REQUEST_CODE
            )
        }
    }

    private fun initializeWebView() {
        val webView = binding.webView
        
        // Configure WebView Settings
        val settings = webView.settings.apply {
            // Performance & Rendering
            setRenderPriority(WebSettings.RenderPriority.HIGH)
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            
            // Cache Configuration
            cacheMode = WebSettings.LOAD_DEFAULT
            databaseEnabled = true
            domStorageEnabled = true
            
            // JavaScript & Plugins
            javaScriptEnabled = true
            javaScriptCanOpenWindowsAutomatically = true
            
            // Media
            mediaPlaybackRequiresUserGesture = false
            
            // Zoom & Display
            builtInZoomControls = false
            displayZoomControls = false
            setSupportZoom(true)
            useWideViewPort = true
            loadWithOverviewMode = true
            
            // File Access
            allowFileAccess = true
            allowContentAccess = true
            
            // User Agent (optional - add app identifier)
            userAgentString = userAgentString + " SaukiMartApp/2.6.0"
            
            // Geolocation
            setGeolocationEnabled(true)
            
            // Database
            databasePath = getDatabasePath("webkit")
        }

        // Dark mode support (Android 10+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            if (WebViewFeature.isFeatureSupported(WebViewFeature.FORCE_DARK)) {
                WebSettingsCompat.setForceDark(settings, WebSettingsCompat.FORCE_DARK_ON)
            }
        }

        // WebViewClient for handling navigation
        webView.webViewClient = CustomWebViewClient(this)

        // WebChromeClient for advanced features
        webView.webChromeClient = CustomWebChromeClient(this)

        // Add JavaScript interface for native communication
        webView.addJavascriptInterface(WebViewInterface(this), "Android")

        // Enable debugging in debug builds
        if (BuildConfig.DEBUG) {
            WebView.setWebContentsDebuggingEnabled(true)
        }

        // Cache management
        val cachePath = File(cacheDir, "webview_cache")
        if (!cachePath.exists()) {
            cachePath.mkdirs()
        }
    }

    private fun setupProgressBar() {
        binding.progressBar.visibility = View.GONE
    }

    private fun loadWebsite() {
        binding.webView.loadUrl(WEBSITE_URL)
    }

    private fun handleDeepLink(intent: Intent) {
        val action = intent.action
        val data = intent.data

        if (action == Intent.ACTION_VIEW && data != null) {
            val deepLinkUrl = data.toString()
            binding.webView.loadUrl(deepLinkUrl)
        }
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_BACK && binding.webView.canGoBack()) {
            binding.webView.goBack()
            return true
        }
        return super.onKeyDown(keyCode, event)
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        
        if (requestCode == PERMISSION_REQUEST_CODE) {
            for (i in grantResults.indices) {
                if (grantResults[i] == PackageManager.PERMISSION_DENIED) {
                    Toast.makeText(
                        this,
                        "Permission denied: ${permissions[i]}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }
    }

    override fun onActivityResult(
        requestCode: Int,
        resultCode: Int,
        data: Intent?
    ) {
        super.onActivityResult(requestCode, resultCode, data)

        when (requestCode) {
            FILE_CHOOSER_REQUEST_CODE -> {
                if (resultCode == RESULT_OK && data != null) {
                    val result = data.data
                    filePathCallback?.onReceiveValue(
                        if (result != null) arrayOf(result) else arrayOf()
                    )
                    filePathCallback = null
                } else {
                    filePathCallback?.onReceiveValue(arrayOf())
                    filePathCallback = null
                }
            }
        }
    }

    inner class CustomWebViewClient(private val context: Context) : WebViewClient() {

        override fun onPageStarted(
            view: WebView?,
            url: String?,
            favicon: Bitmap?
        ) {
            super.onPageStarted(view, url, favicon)
            binding.progressBar.visibility = View.VISIBLE
            binding.progressBar.progress = 0
        }

        override fun onPageFinished(view: WebView?, url: String?) {
            super.onPageFinished(view, url)
            binding.progressBar.visibility = View.GONE

            // Inject CSS for app optimization
            injectAppCSS()
        }

        override fun shouldOverrideUrlLoading(
            view: WebView?,
            request: WebResourceRequest?
        ): Boolean {
            val url = request?.url.toString()

            return when {
                url.startsWith("http://") || url.startsWith("https://") -> {
                    view?.loadUrl(url)
                    false
                }
                url.startsWith("tel:") -> {
                    startActivity(Intent(Intent.ACTION_DIAL, Uri.parse(url)))
                    true
                }
                url.startsWith("mailto:") -> {
                    startActivity(Intent(Intent.ACTION_SENDTO, Uri.parse(url)))
                    true
                }
                url.startsWith("whatsapp:") -> {
                    startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                    true
                }
                else -> false
            }
        }

        override fun onReceivedError(
            view: WebView?,
            request: WebResourceRequest?,
            error: WebResourceError?
        ) {
            super.onReceivedError(view, request, error)
            Toast.makeText(
                context,
                "Error loading page: ${error?.description}",
                Toast.LENGTH_SHORT
            ).show()
        }

        private fun injectAppCSS() {
            val css = """
                body { 
                    padding-bottom: 20px; 
                    -webkit-user-select: text;
                    user-select: text;
                }
                input, textarea, select {
                    -webkit-user-select: text;
                    user-select: text;
                }
            """.trimIndent()

            binding.webView.evaluateJavascript(
                "javascript:(function(){" +
                "var style = document.createElement('style');" +
                "style.innerHTML = '$css';" +
                "document.head.appendChild(style);" +
                "})()"
            ) {}
        }
    }

    inner class CustomWebChromeClient(private val context: Context) : WebChromeClient() {

        override fun onProgressChanged(view: WebView?, newProgress: Int) {
            super.onProgressChanged(view, newProgress)
            binding.progressBar.progress = newProgress
        }

        override fun onShowFileChooser(
            webView: WebView?,
            filePathCallback: ValueCallback<Array<Uri>>?,
            fileChooserParams: FileChooserParams?
        ): Boolean {
            this@MainActivity.filePathCallback = filePathCallback
            
            val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                addCategory(Intent.CATEGORY_OPENABLE)
                type = fileChooserParams?.acceptTypes?.joinToString(",") ?: "*/*"
            }
            
            startActivityForResult(intent, FILE_CHOOSER_REQUEST_CODE)
            return true
        }

        override fun onPermissionRequest(request: PermissionRequest?) {
            request?.grant(request.resources)
        }

        override fun onGeolocationPermissionsShowPrompt(
            origin: String?,
            callback: GeolocationPermissions.Callback?
        ) {
            callback?.invoke(origin, true, false)
        }

        override fun onJsAlert(
            view: WebView?,
            url: String?,
            message: String?,
            result: JsResult?
        ): Boolean {
            Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
            result?.confirm()
            return true
        }
    }

    class WebViewInterface(private val context: Context) {
        @JavascriptInterface
        fun getDeviceInfo(): String {
            return "{\n" +
                    "  \"model\": \"${Build.MODEL}\",\n" +
                    "  \"manufacturer\": \"${Build.MANUFACTURER}\",\n" +
                    "  \"version\": \"${Build.VERSION.RELEASE}\",\n" +
                    "  \"sdk\": ${Build.VERSION.SDK_INT}\n" +
                    "}"
        }

        @JavascriptInterface
        fun shareContent(title: String, text: String) {
            val intent = Intent().apply {
                action = Intent.ACTION_SEND
                putExtra(Intent.EXTRA_TITLE, title)
                putExtra(Intent.EXTRA_TEXT, text)
                type = "text/plain"
            }
            context.startActivity(Intent.createChooser(intent, "Share"))
        }

        @JavascriptInterface
        fun closeApp() {
            (context as? MainActivity)?.finish()
        }
    }
}
```

### Step 5: Create Firebase Messaging Service

```kotlin
package com.saukiland.saukimart

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class FirebaseMessagingService : FirebaseMessagingService() {

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        val title = remoteMessage.notification?.title ?: "SaukiMart"
        val body = remoteMessage.notification?.body ?: ""

        sendNotification(title, body, remoteMessage.data)
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        // Send token to your server
        sendTokenToServer(token)
    }

    private fun sendNotification(
        title: String,
        body: String,
        data: Map<String, String>
    ) {
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            data.forEach { (key, value) ->
                putExtra(key, value)
            }
        }

        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        createNotificationChannel()

        val notification = NotificationCompat.Builder(this, "saukiland_channel")
            .setContentTitle(title)
            .setContentText(body)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .build()

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE)
            as NotificationManager

        notificationManager.notify(System.currentTimeMillis().toInt(), notification)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "saukiland_channel",
                "SaukiMart Notifications",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications from SaukiMart"
                enableVibration(true)
                enableLights(true)
            }

            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE)
                as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun sendTokenToServer(token: String) {
        // TODO: Send token to your backend
        // This allows you to send push notifications from your server
    }
}
```

### Step 6: Utility Classes

#### `WebViewUtils.kt`
```kotlin
package com.saukiland.saukimart.utils

import android.content.Context
import android.net.ConnectivityManager
import android.os.Environment
import java.io.File

object WebViewUtils {

    fun isNetworkAvailable(context: Context): Boolean {
        val connectivityManager = context.getSystemService(
            Context.CONNECTIVITY_SERVICE
        ) as ConnectivityManager
        val activeNetwork = connectivityManager.activeNetwork
        return activeNetwork != null
    }

    fun getCacheDir(context: Context): File {
        val cacheDir = File(context.cacheDir, "webview")
        if (!cacheDir.exists()) {
            cacheDir.mkdirs()
        }
        return cacheDir
    }

    fun clearCache(context: Context) {
        val cacheDir = getCacheDir(context)
        cacheDir.deleteRecursively()
    }

    fun getAppVersion(): String {
        return "2.6.0"
    }
}
```

#### `CacheManager.kt`
```kotlin
package com.saukiland.saukimart.utils

import android.content.Context
import android.webkit.WebView
import android.webkit.WebViewDatabase
import java.io.File

object CacheManager {

    fun clearAllCache(context: Context, webView: WebView) {
        // Clear WebView cache
        webView.clearCache(true)
        webView.clearHistory()
        
        // Clear cookies
        android.webkit.CookieManager.getInstance().removeAllCookies(null)
        
        // Clear local storage
        WebViewDatabase.getInstance(context).clearUsernamePassword()
        
        // Clear app cache
        val cacheDir = context.cacheDir
        cacheDir.deleteRecursively()
        
        // Clear app data
        val appDataDir = File("/data/data/${context.packageName}")
        appDataDir.deleteRecursively()
    }

    fun clearCookies() {
        val cookieManager = android.webkit.CookieManager.getInstance()
        cookieManager.removeAllCookies(null)
        cookieManager.flush()
    }

    fun enableCaching(webView: WebView) {
        webView.settings.apply {
            cacheMode = android.webkit.WebSettings.LOAD_DEFAULT
            databaseEnabled = true
            domStorageEnabled = true
        }
    }
}
```

#### `DeepLinkHandler.kt`
```kotlin
package com.saukiland.saukimart.utils

import android.content.Intent
import android.net.Uri

object DeepLinkHandler {

    fun handleDeepLink(intent: Intent, onDeepLinkDetected: (String) -> Unit) {
        val action = intent.action
        val data = intent.data

        if (action == Intent.ACTION_VIEW && data != null) {
            val deepLink = data.toString()
            onDeepLinkDetected(deepLink)
        }
    }

    fun createDeepLink(
        scheme: String,
        host: String,
        path: String,
        params: Map<String, String> = emptyMap()
    ): String {
        var url = "$scheme://$host$path"
        
        if (params.isNotEmpty()) {
            url += "?"
            url += params.entries.joinToString("&") { (key, value) ->
                "$key=$value"
            }
        }
        
        return url
    }
}
```

---

## 🎨 Part 4: Layout & Resource Files

### `res/layout/activity_main.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">

    <!-- Progress Bar -->
    <ProgressBar
        android:id="@+id/progressBar"
        android:layout_width="match_parent"
        android:layout_height="2dp"
        android:layout_marginTop="0dp"
        android:indeterminate="true"
        android:visibility="gone" />

    <!-- WebView -->
    <WebView
        android:id="@+id/webView"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

</LinearLayout>
```

### `res/layout/activity_splash.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@drawable/splash_background">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:gravity="center"
        android:orientation="vertical">

        <!-- Logo -->
        <ImageView
            android:layout_width="120dp"
            android:layout_height="120dp"
            android:src="@mipmap/ic_launcher_round"
            android:contentDescription="@string/app_name" />

        <!-- App Name -->
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="24dp"
            android:text="@string/app_name"
            android:textSize="28sp"
            android:textStyle="bold"
            android:textColor="@color/white" />

        <!-- Version -->
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="8dp"
            android:text="v2.6.0"
            android:textSize="14sp"
            android:textColor="@color/white" />

        <!-- Loading Animation -->
        <ProgressBar
            android:layout_width="32dp"
            android:layout_height="32dp"
            android:layout_marginTop="32dp" />

    </LinearLayout>

</FrameLayout>
```

### `res/values/strings.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">SaukiMart</string>
    <string name="website_url">https://yourdomain.com</string>
</resources>
```

### `res/values/colors.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="purple_200">#FFBB86FC</color>
    <color name="purple_500">#FF6200EE</color>
    <color name="purple_700">#FF3700B3</color>
    <color name="teal_200">#FF03DAC5</color>
    <color name="teal_700">#FF018786</color>
    <color name="black">#FF000000</color>
    <color name="white">#FFFFFFFF</color>
    <color name="primary">#FF6200EE</color>
</resources>
```

### `res/values/themes.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.SaukiMartApp" parent="Theme.MaterialComponents.DayNight.DarkActionBar">
        <item name="colorPrimary">@color/purple_500</item>
        <item name="colorPrimaryVariant">@color/purple_700</item>
        <item name="colorSecondary">@color/teal_200</item>
        <item name="colorSecondaryVariant">@color/teal_700</item>
        <item name="colorError">@android:color/holo_red_light</item>
        <item name="colorOnPrimary">@color/white</item>
        <item name="colorOnSecondary">@color/black</item>
        <item name="colorOnBackground">@color/black</item>
        <item name="colorOnSurface">@color/black</item>
        <item name="android:windowActionBar">false</item>
        <item name="android:windowNoTitle">true</item>
    </style>

    <style name="SplashTheme" parent="Theme.SaukiMartApp">
        <item name="android:windowFullscreen">true</item>
        <item name="android:windowNoTitle">true</item>
        <item name="android:windowActionBar">false</item>
        <item name="android:windowDrawsSystemBarBackgrounds">false</item>
    </style>
</resources>
```

---

## 🎯 Part 5: Advanced Features

### Feature 1: Offline Support with Service Workers

Your website should implement Service Workers for offline capability:

```javascript
// public/service-worker.js
const CACHE_VERSION = 'v1-2.6.0';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/main.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(CACHE_URLS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_VERSION) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

### Feature 2: JavaScript to Native Communication

**From JavaScript (Website):**
```javascript
// Call native Android code
function getDeviceInfo() {
  if (window.Android) {
    const info = window.Android.getDeviceInfo();
    console.log(info);
  }
}

function shareContent() {
  if (window.Android) {
    window.Android.shareContent('Check this out!', 'Visit SaukiMart');
  }
}

function closeApp() {
  if (window.Android) {
    window.Android.closeApp();
  }
}
```

### Feature 3: Enhanced Push Notifications

Update your website to register for push notifications:

```javascript
// scripts/push-notification.js
function requestPushNotificationPermission() {
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      console.log('Notification permission granted');
      // Get FCM token from Android
      if (window.Android) {
        // Android will handle FCM token and send to server
      }
    }
  });
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
```

### Feature 4: Payment Gateway Integration

```kotlin
// In MainActivity or separate module
class PaymentHandler(private val context: Context) {

    fun processPayment(
        amount: Double,
        orderId: String,
        onSuccess: (transactionId: String) -> Unit,
        onFailure: (error: String) -> Unit
    ) {
        // Integrate with Stripe, PayPal, or your preferred gateway
        // For Stripe example:
        val paymentMethodParams = mapOf(
            "amount" to (amount * 100).toLong(),
            "currency" to "USD"
        )
        
        // Make API call to your backend
    }
}
```

---

## 🚀 Part 6: Building & Signing APK

### Step 1: Generate Signing Key

```bash
# Generate keystore
keytool -genkey -v -keystore saukiland.jks -keyalg RSA -keysize 2048 -validity 10000 -alias saukiland

# Fill in the prompted information:
# Keystore password: [SECURE_PASSWORD]
# Key password: [SECURE_PASSWORD]
# First and last name: SaukiLand
# Organizational unit: Development
# Organization: SaukiLand
# City: Dubai
# State: UAE
# Country code: AE
```

### Step 2: Store Keystore Safely

```bash
# Move keystore to secure location
mv saukiland.jks ~/.android/

# Set permissions
chmod 600 ~/.android/saukiland.jks
```

### Step 3: Configure Build Signing

Update `build.gradle.kts`:

```kotlin
signingConfigs {
    create("release") {
        storeFile = file("/home/user/.android/saukiland.jks")
        storePassword = "YOUR_PASSWORD"
        keyAlias = "saukiland"
        keyPassword = "YOUR_PASSWORD"
    }
}

buildTypes {
    release {
        signingConfig = signingConfigs.getByName("release")
        isMinifyEnabled = true
        isShrinkResources = true
        proguardFiles(
            getDefaultProguardFile("proguard-android-optimize.txt"),
            "proguard-rules.pro"
        )
    }
}
```

### Step 4: Build APK

**From Android Studio:**
1. Go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Wait for build to complete
3. APK located at: `app/release/app-release.apk`

**From Terminal:**
```bash
cd /path/to/project
./gradlew clean build
./gradlew assembleRelease

# Output
# app/build/outputs/apk/release/app-release.apk
```

### Step 5: Build Android App Bundle (AAB)

For Google Play Store distribution:

```bash
./gradlew bundleRelease

# Output
# app/build/outputs/bundle/release/app-release.aab
```

### Step 6: Verify APK

```bash
# Check APK contents
unzip -l app/build/outputs/apk/release/app-release.apk

# Verify signature
jarsigner -verify -verbose app-release.apk

# Get certificate info
keytool -printcert -jarfile app-release.apk
```

---

## 📱 Part 7: Testing

### Unit Testing

Create `app/src/test/java/com/saukiland/saukimart/WebViewUtilsTest.kt`:

```kotlin
import org.junit.Test
import org.junit.Assert.*

class WebViewUtilsTest {

    @Test
    fun testGetAppVersion() {
        val version = WebViewUtils.getAppVersion()
        assertEquals("2.6.0", version)
    }
}
```

### Instrumentation Testing

Create `app/src/androidTest/java/com/saukiland/saukimart/MainActivityTest.kt`:

```kotlin
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.filters.LargeTest
import androidx.test.rule.ActivityTestRule
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
@LargeTest
class MainActivityTest {

    @get:Rule
    val activityRule = ActivityTestRule(MainActivity::class.java)

    @Test
    fun testWebViewLoads() {
        // Test that WebView loads
        Thread.sleep(3000)
        // Assert page loaded
    }
}
```

### Run Tests

```bash
# Unit tests
./gradlew test

# Instrumentation tests
./gradlew connectedAndroidTest
```

---

## 📦 Part 8: Publishing to Google Play Store

### Step 1: Create Google Play Developer Account

- Go to [Google Play Console](https://play.google.com/console)
- Pay $25 registration fee
- Complete developer profile

### Step 2: Create App Entry

1. Click **Create app**
2. Enter:
   - **App name:** SaukiMart
   - **Default language:** English
   - **App type:** App
   - **Category:** Shopping

### Step 3: Prepare Store Listing

1. **App details:**
   - Short description (80 characters max)
   - Full description (4000 characters max)
   - Upload app icon (512x512 PNG)
   - Upload screenshots (min 2, max 8)
   - Upload feature graphic (1024x500 PNG)

2. **Content rating:**
   - Complete questionnaire
   - Google provides IARC rating

3. **Target audience:**
   - Select age groups
   - Content rating

### Step 4: Set Pricing & Distribution

- Choose: Free or Paid
- Select countries
- Configure: Device requirements, minimum API level

### Step 5: Upload Release APK

1. Go to **Release** → **Production**
2. Click **Create new release**
3. Upload `app-release.aab` (App Bundle)
4. Review changelog:
   ```
   v2.6.0 Release Notes:
   - Native Android WebView app
   - Full offline support
   - Push notifications via Firebase
   - Enhanced performance
   - Dark mode support
   - Deep linking support
   ```

### Step 6: Review & Submit

1. Review all information
2. Accept consent checkboxes
3. Click **Review release**
4. Click **Start rollout to production**

---

## 🔒 Part 9: Security Best Practices

### 1. Enable ProGuard Obfuscation

Update `proguard-rules.pro`:

```proguard
# Keep activities and services
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver

# Keep WebView classes
-keep class android.webkit.** { *; }
-keep class androidx.webkit.** { *; }

# Keep Firebase classes
-keep class com.google.firebase.** { *; }

# Remove logging
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
}

# Optimization
-optimizationpasses 5
-dontusemixedcaseclassnames
-verbose
```

### 2. Implement Content Security Policy

Add to your website's HTML head:

```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' data:;
    connect-src 'self' https://yourdomain.com;
    frame-ancestors 'none';
">
```

### 3. Enable SSL/TLS Pinning

```kotlin
// Certificate Pinning (Optional)
val certificatePinner = CertificatePinner.Builder()
    .add("yourdomain.com", "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")
    .build()

val httpClient = OkHttpClient.Builder()
    .certificatePinner(certificatePinner)
    .build()
```

### 4. Secure SharedPreferences

```kotlin
// Use EncryptedSharedPreferences
val masterKey = MasterKey.Builder(context)
    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
    .build()

val encryptedPrefs = EncryptedSharedPreferences.create(
    context,
    "secret_shared_prefs",
    masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
)
```

---

## ⚙️ Part 10: Performance Optimization

### 1. Enable Hardware Acceleration

Already done in `AndroidManifest.xml`:
```xml
android:hardwareAccelerated="true"
```

### 2. Optimize Image Loading

```kotlin
// Use Glide for image loading
implementation("com.bumptech.glide:glide:4.16.0")
```

```javascript
// On website, optimize images
<img loading="lazy" src="image.jpg" alt="Description">
```

### 3. Minify & Compress Assets

```kotlin
// In build.gradle.kts
buildTypes {
    release {
        isMinifyEnabled = true
        isShrinkResources = true
    }
}
```

### 4. Enable Brotli Compression

Add to your website's server configuration:
```nginx
gzip on;
brotli on;
gzip_types text/plain text/css application/json application/javascript;
brotli_types text/plain text/css application/json application/javascript;
```

### 5. Implement Lazy Loading

```kotlin
// In WebView settings
settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
settings.cacheMode = WebSettings.LOAD_DEFAULT
```

---

## 🐛 Part 11: Debugging & Troubleshooting

### Enable Remote Debugging

```kotlin
if (BuildConfig.DEBUG) {
    WebView.setWebContentsDebuggingEnabled(true)
}
```

Access at: `chrome://inspect/#devices` in Chrome browser

### Common Issues & Solutions

**Issue: Website doesn't load**
```kotlin
// Check logs
adb logcat | grep "MainActivity"

// Solution: Verify INTERNET permission in AndroidManifest.xml
```

**Issue: JavaScript interface not working**
```kotlin
// Verify interface is added
webView.addJavascriptInterface(WebViewInterface(this), "Android")

// Check in JS
if (window.Android) {
    console.log("Android interface available");
}
```

**Issue: Camera/Location permissions denied**
```kotlin
// Request permissions explicitly
ActivityCompat.requestPermissions(this, arrayOf(
    Manifest.permission.CAMERA,
    Manifest.permission.ACCESS_FINE_LOCATION
), PERMISSION_REQUEST_CODE)
```

**Issue: APK too large**
```kotlin
// Enable splitting
splits {
    abi {
        enable = true
        reset()
        include("x86", "x86_64", "armeabi-v7a", "arm64-v8a")
        universalApk = true
    }
}
```

---

## 📊 Part 12: Monitoring & Analytics

### Integrate Firebase Analytics

```kotlin
// Already in AndroidManifest.xml
<service android:name=".FirebaseMessagingService" ... />
```

```kotlin
// Log custom events
val analytics = FirebaseAnalytics.getInstance(this)
val bundle = Bundle().apply {
    putString("page", "home")
}
analytics.logEvent("page_view", bundle)
```

### Track App Performance

```kotlin
// Google Analytics 4
implementation("com.google.android.gms:play-services-analytics:18.0.4")
```

---

## 📋 Part 13: Deployment Checklist

- [ ] Update version code and name
- [ ] Update website URL in code
- [ ] Enable ProGuard obfuscation
- [ ] Test on multiple devices
- [ ] Generate signed APK/AAB
- [ ] Test signed APK on device
- [ ] Verify all features working
- [ ] Test offline functionality
- [ ] Test push notifications
- [ ] Review security settings
- [ ] Update privacy policy
- [ ] Create app store listing
- [ ] Upload screenshots
- [ ] Set pricing and countries
- [ ] Submit for review

---

## 🎓 Part 14: Advanced Customization

### Custom Notification Styles

```kotlin
val notification = NotificationCompat.Builder(this, "channel_id")
    .setSmallIcon(R.drawable.ic_notification)
    .setLargeIcon(bitmap)
    .setStyle(NotificationCompat.BigTextStyle()
        .bigText("Your long notification text"))
    .setColor(Color.parseColor("#FF6200EE"))
    .build()
```

### In-App Update Implementation

```kotlin
// Check for updates
val appUpdateManager = AppUpdateManagerFactory.create(this)
val appUpdateInfo = appUpdateManager.appUpdateInfo.addOnSuccessListener { info ->
    if (info.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE) {
        appUpdateManager.startUpdateFlowForResult(
            info,
            AppUpdateType.FLEXIBLE,
            this,
            101
        )
    }
}
```

### App Shortcuts

```xml
<!-- res/xml/shortcuts.xml -->
<shortcuts xmlns:android="http://schemas.android.com/apk/res/android">
    <shortcut
        android:shortcutId="home"
        android:enabled="true"
        android:icon="@drawable/ic_home"
        android:shortcutShortLabel="@string/home"
        android:shortcutLongLabel="@string/home_long">
        <intent
            android:action="android.intent.action.MAIN"
            android:targetPackage="com.saukiland.saukimart"
            android:targetClass="com.saukiland.saukimart.MainActivity" />
    </shortcut>
</shortcuts>
```

---

## 📚 Part 15: Resources & References

- **Official Android Documentation:** https://developer.android.com
- **Android WebView Guide:** https://developer.android.com/guide/webapps/webview
- **Firebase Documentation:** https://firebase.google.com/docs
- **Google Play Console:** https://play.google.com/console
- **Material Design Guidelines:** https://material.io/design

---

## 🎉 Conclusion

You now have a comprehensive guide to build a native Android WebView application that:

✅ Loads your website as a true native app  
✅ Provides native Android features and integrations  
✅ Works offline with Service Workers  
✅ Supports push notifications  
✅ Handles permissions properly  
✅ Can be published on Google Play Store  
✅ Offers superior user experience vs PWA  
✅ Maintains full control and branding  

**Next Steps:**
1. Create the Android project following Part 2
2. Implement core features from Part 3
3. Add advanced features from Part 5
4. Test thoroughly using Part 7
5. Build and sign APK using Part 6
6. Publish to Google Play Store using Part 8

Good luck with your SaukiMart Android app! 🚀

