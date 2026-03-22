I have some additions I need made to the app. Please implement the following:

**1. Add a JavaScript-to-native share bridge**

Add a `@JavascriptInterface` class called `AndroidShareBridge` with this method:

```kotlin
@JavascriptInterface
fun shareFile(base64Data: String, mimeType: String, fileName: String)
```

It should:
- Decode `base64Data` to a byte array
- Write it to `cacheDir/shared/<fileName>` (create the `shared/` folder if it doesn't exist)
- Get a `FileProvider` URI using `FileProvider.getUriForFile()` with authority `"${applicationId}.fileprovider"`
- Create an `Intent(Intent.ACTION_SEND)`, set `type = mimeType`, put the URI as `EXTRA_STREAM`, add `FLAG_GRANT_READ_URI_PERMISSION`
- Launch it via `startActivity(Intent.createChooser(intent, "Share via"))`

Register the interface on the WebView:
```kotlin
webView.addJavascriptInterface(AndroidShareBridge(this), "saukiShareFile")
```

**2. Confirm these WebView settings are enabled**

```kotlin
settings.javaScriptEnabled = true
settings.domStorageEnabled = true
settings.allowFileAccessFromFileURLs = false   // keep false for security
settings.allowContentAccess = true
```

**3. Add a FileProvider to AndroidManifest.xml**

Inside `<application>`:
```xml
<provider
    android:name="androidx.core.content.FileProvider"
    android:authorities="${applicationId}.fileprovider"
    android:exported="false"
    android:grantUriPermissions="true">
    <meta-data
        android:name="android.support.FILE_PROVIDER_PATHS"
        android:resource="@xml/file_paths" />
</provider>
```

**4. Create `res/xml/file_paths.xml`**

```xml
<?xml version="1.0" encoding="utf-8"?>
<paths>
    <cache-path name="shared" path="shared/" />
</paths>
```

**5. Do not change any existing functionality** — keep all current code (billing, notifications, etc.) intact. Only add the bridge class, the FileProvider entry, and the file_paths resource.

Please show me:
- The complete updated Activity file with the changes
- The AndroidManifest.xml `<application>` block
- The new `res/xml/file_paths.xml`

Also, after making these changes, please increment `versionCode` by 1 and `versionName` by 0.1 (e.g. `1.0` → `1.1`) in `build.gradle` (or `build.gradle.kts`).
