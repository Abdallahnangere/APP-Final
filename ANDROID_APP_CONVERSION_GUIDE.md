# Sauki Mart - Android App Conversion Guide
## Complete Documentation for Building Native Android App

**Created:** January 27, 2026  
**For:** Sauki Mart e-commerce platform  
**Scope:** Full-featured native Android application mirroring web PWA functionality

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Analysis](#architecture-analysis)
3. [Technology Stack for Android](#technology-stack-for-android)
4. [Feature-by-Feature Implementation](#feature-by-feature-implementation)
5. [API Integration](#api-integration)
6. [Database Considerations](#database-considerations)
7. [Authentication & Security](#authentication--security)
8. [UI/UX Implementation](#uiux-implementation)
9. [Push Notifications](#push-notifications)
10. [Payment Integration](#payment-integration)
11. [Data Persistence](#data-persistence)
12. [Performance & Optimization](#performance--optimization)
13. [Testing Strategy](#testing-strategy)
14. [Deployment Pipeline](#deployment-pipeline)

---

## Project Overview

### Current Web App Structure

**Sauki Mart** is a sophisticated e-commerce platform serving as an agent network for:
- **Mobile data sales** (MTN, Airtel, GLO, 9Mobile)
- **Electronics store** (devices, SIM cards)
- **Agent wallet management** with PIN-based authentication
- **Admin dashboard** for business operations
- **Push notifications** for real-time updates
- **Transaction tracking** with receipt generation

### Web Stack (Current Implementation)

```
Frontend:        Next.js 14 + React 18 + TypeScript
Styling:         Tailwind CSS + Framer Motion
Backend:         Next.js API Routes
Database:        PostgreSQL (via Prisma ORM)
Authentication:  PIN-based (agents)
Payments:        Flutterwave API
Notifications:   Web Push + Firebase Cloud Messaging
Caching:         Service Worker + Browser Storage
```

### Android App Goals

Create a **native Android app** that provides the same functionality with:
- Native performance and OS integration
- Offline capability
- Push notification support
- Secure authentication
- Fast startup and response times

---

## Architecture Analysis

### Current Web App Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Browser)                   │
│  - React Components (Home, Data, Store, Agent, History)    │
│  - localStorage for state persistence                       │
│  - Service Worker for offline support                       │
│  - Firebase Messaging client                                │
└─────────────────────────────────────────────────────────────┘
                              ↓ (HTTP/REST)
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (Next.js)                       │
│  • Agent Operations:                                        │
│    - POST /api/agent/login (PIN verification)              │
│    - POST /api/agent/register (new agents)                 │
│    - POST /api/agent/purchase (wallet debit)               │
│    - GET /api/agent/balance (read-only)                    │
│    - POST /api/agent/update-pin                            │
│    - POST /api/agent/redeem-cashback                       │
│                                                             │
│  • Customer Operations:                                    │
│    - GET /api/products (list all devices)                  │
│    - GET /api/data-plans (list data packages)              │
│    - POST /api/data/initiate-payment (Flutterwave)         │
│    - POST /api/ecommerce/pay (product checkout)            │
│    - GET /api/transactions/track (delivery status)         │
│    - POST /api/transactions/verify (check pending)         │
│    - GET /api/transactions/list (history)                  │
│                                                             │
│  • Support:                                                │
│    - POST /api/support (submit tickets)                    │
│    - GET /api/system/message (broadcast messages)          │
│                                                             │
│  • Admin:                                                  │
│    - POST /api/admin/push (send notifications)             │
│    - POST /api/admin/auth (admin login)                    │
│    - Various management endpoints                          │
│                                                             │
│  • Webhooks:                                               │
│    - POST /webhook/flutterwave (payment updates)           │
│    - POST /webhook/amigo (delivery updates)                │
└─────────────────────────────────────────────────────────────┘
                              ↓ (PostgreSQL)
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                            │
│  Tables:                                                    │
│  - Products (devices, SIM cards)                           │
│  - DataPlans (MTN/Airtel/GLO packages)                     │
│  - Agents (distributor network)                            │
│  - Transactions (all orders)                               │
│  - PushSubscriptions (notification tracking)               │
│  - SupportTickets (customer support)                       │
│  - SystemMessages (broadcasts)                             │
│  - CashbackEntry (agent cashback ledger)                   │
│  - WebhookLog (audit trail)                                │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Patterns

#### 1. **Agent Login Flow**
```
Agent (PIN) → POST /api/agent/login → Verify against DB → Return agentId + balance
```

#### 2. **Data Purchase Flow**
```
Customer (phone) → Select Plan → POST /api/data/initiate-payment 
→ Flutterwave Bank Transfer → Webhook callback 
→ Call Amigo API → Deliver airtime → Update Transaction status
```

#### 3. **Product Purchase Flow**
```
Customer → Add to Cart → POST /api/ecommerce/pay (Flutterwave)
→ Payment confirmed → Address captured → Logistics API → Delivered
```

#### 4. **Push Notification Flow**
```
Admin → POST /api/admin/push → Query PushSubscription table 
→ Web Push API or Firebase Cloud Messaging → User device
```

---

## Technology Stack for Android

### Recommended Android Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Language** | Kotlin | Modern, null-safe, Google-endorsed |
| **Architecture** | MVVM + Clean Architecture | Testable, maintainable, scalable |
| **UI Framework** | Jetpack Compose | Modern declarative UI, similar to React |
| **Network** | Retrofit + OkHttp | Type-safe REST client with interceptors |
| **Database** | Room + SQLite | Type-safe local persistence, migrations |
| **Async** | Coroutines + Flow | Structured concurrency, reactive programming |
| **Dependency Injection** | Hilt | Built for Android, reduces boilerplate |
| **Navigation** | Jetpack Navigation | Fragment-based, deep linking support |
| **Image Loading** | Coil | Lightweight, coroutine-based |
| **Payment** | Flutterwave SDK | Native integration with existing backend |
| **Notifications** | Firebase Cloud Messaging | Push notification delivery |
| **Local Storage** | DataStore (Preferences) | Secure key-value storage for tokens |
| **State Management** | ViewModel + StateFlow | Lifecycle-aware, observable state |

### Project Structure

```
sauki-mart-android/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/saukimart/
│   │   │   │   ├── di/                  # Hilt modules (Retrofit, Room, etc.)
│   │   │   │   ├── data/
│   │   │   │   │   ├── local/          # Room database definitions
│   │   │   │   │   ├── remote/         # API services (Retrofit)
│   │   │   │   │   └── repository/     # Repository pattern
│   │   │   │   ├── domain/
│   │   │   │   │   ├── model/          # Data classes (Agent, Transaction, etc.)
│   │   │   │   │   └── usecase/        # Business logic
│   │   │   │   └── presentation/
│   │   │   │       ├── ui/
│   │   │   │       │   ├── screens/    # Each screen (Home, Data, Store, etc.)
│   │   │   │       │   ├── components/ # Reusable composables
│   │   │   │       │   └── theme/      # Theming (colors, typography)
│   │   │   │       └── viewmodel/      # ViewModels for each screen
│   │   │   ├── AndroidManifest.xml
│   │   │   └── res/                    # Resources (drawables, strings, etc.)
│   │   └── test/
│   └── build.gradle.kts
├── gradle/
└── build.gradle.kts
```

---

## Feature-by-Feature Implementation

### 1. **Home Screen**

**Current Web Implementation:**
- Network logos (MTN, Airtel, GLO, 9Mobile)
- Quick action buttons
- Featured products
- User greeting with phone number
- Promotional banners

**Android Implementation:**

```kotlin
// HomeViewModel.kt
class HomeViewModel(
    private val agentRepository: AgentRepository,
    private val productRepository: ProductRepository,
    private val systemRepository: SystemRepository
) : ViewModel() {
    
    private val _userState = MutableStateFlow<AgentUiState>(AgentUiState.Loading)
    val userState = _userState.asStateFlow()
    
    private val _productsState = MutableStateFlow<List<Product>>(emptyList())
    val productsState = _productsState.asStateFlow()
    
    private val _messagesState = MutableStateFlow<List<SystemMessage>>(emptyList())
    val messagesState = _messagesState.asStateFlow()
    
    fun loadInitialData(userPhone: String) {
        viewModelScope.launch {
            try {
                // Load concurrently
                supervisorScope {
                    val agentDeferred = async { agentRepository.getBalance(userPhone) }
                    val productsDeferred = async { productRepository.getProducts() }
                    val messagesDeferred = async { systemRepository.getMessages() }
                    
                    _userState.value = AgentUiState.Success(agentDeferred.await())
                    _productsState.value = productsDeferred.await()
                    _messagesState.value = messagesDeferred.await()
                }
            } catch (e: Exception) {
                _userState.value = AgentUiState.Error(e.message ?: "Unknown error")
            }
        }
    }
}

// HomeScreen.kt
@Composable
fun HomeScreen(viewModel: HomeViewModel) {
    val userState by viewModel.userState.collectAsState()
    val products by viewModel.productsState.collectAsState()
    val messages by viewModel.messagesState.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.loadInitialData(getStoredPhone())
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
    ) {
        // User greeting
        when (userState) {
            is AgentUiState.Success -> {
                Text("Welcome, ${userState.agent.firstName}")
                Text("Balance: ₦${userState.agent.balance}")
            }
            is AgentUiState.Loading -> CircularProgressIndicator()
            is AgentUiState.Error -> Text("Error: ${userState.message}")
        }
        
        // Network selector with grid
        GridButtons()
        
        // Products carousel
        ProductCarousel(products)
        
        // Broadcast messages
        MessageBanner(messages)
    }
}
```

### 2. **Agent Login Screen**

**Current Web Implementation:**
- Phone number input
- 4-digit PIN input (masked)
- Submit button
- Rate limiting (5 attempts, 5 min cooldown)
- Error messages
- Registration link

**Android Implementation:**

```kotlin
// AgentLoginViewModel.kt
class AgentLoginViewModel(
    private val agentRepository: AgentRepository,
    private val authRepository: AuthRepository
) : ViewModel() {
    
    private val _loginState = MutableStateFlow<LoginUiState>(LoginUiState.Idle)
    val loginState = _loginState.asStateFlow()
    
    private val _phone = MutableStateFlow("")
    val phone = _phone.asStateFlow()
    
    private val _pin = MutableStateFlow("")
    val pin = _pin.asStateFlow()
    
    fun onPhoneChange(value: String) {
        _phone.value = value.filter { it.isDigit() }.take(11)
    }
    
    fun onPinChange(value: String) {
        _pin.value = value.filter { it.isDigit() }.take(4)
    }
    
    fun login() {
        viewModelScope.launch {
            _loginState.value = LoginUiState.Loading
            
            try {
                val response = agentRepository.login(
                    phone = _phone.value,
                    pin = _pin.value
                )
                
                // Save auth token and user data
                authRepository.saveToken(response.token)
                authRepository.saveAgentData(response.agent)
                
                _loginState.value = LoginUiState.Success(response.agent)
            } catch (e: HttpException) {
                when (e.code()) {
                    401 -> _loginState.value = LoginUiState.Error("Invalid PIN")
                    429 -> _loginState.value = LoginUiState.RateLimited(
                        resetTime = e.headers()["Retry-After"]?.toLong() ?: 300
                    )
                    else -> _loginState.value = LoginUiState.Error(e.message())
                }
            } catch (e: Exception) {
                _loginState.value = LoginUiState.Error("Network error: ${e.message}")
            }
        }
    }
}

// AgentLoginScreen.kt
@Composable
fun AgentLoginScreen(
    viewModel: AgentLoginViewModel,
    onLoginSuccess: () -> Unit
) {
    val loginState by viewModel.loginState.collectAsState()
    val phone by viewModel.phone.collectAsState()
    val pin by viewModel.pin.collectAsState()
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // Phone input
        OutlinedTextField(
            value = phone,
            onValueChange = viewModel::onPhoneChange,
            label = { Text("Phone Number") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            modifier = Modifier.fillMaxWidth()
        )
        
        // PIN input (masked)
        OutlinedTextField(
            value = pin,
            onValueChange = viewModel::onPinChange,
            label = { Text("PIN") },
            visualTransformation = PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
            modifier = Modifier.fillMaxWidth()
        )
        
        // Status handling
        when (val state = loginState) {
            LoginUiState.Idle, LoginUiState.Loading -> {
                Button(
                    onClick = viewModel::login,
                    enabled = phone.length == 11 && pin.length == 4 && loginState !is LoginUiState.Loading,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    if (state is LoginUiState.Loading) {
                        CircularProgressIndicator(color = Color.White)
                    } else {
                        Text("Login")
                    }
                }
            }
            is LoginUiState.Error -> {
                Text(state.message, color = Color.Red)
                Button(onClick = viewModel::login) { Text("Retry") }
            }
            is LoginUiState.RateLimited -> {
                Text("Too many attempts. Try again in ${state.resetTime}s", color = Color.Red)
            }
            is LoginUiState.Success -> {
                LaunchedEffect(Unit) { onLoginSuccess() }
            }
        }
    }
}
```

### 3. **Data Purchase Screen**

**Current Web Implementation:**
- Network selector (tabs)
- Data plans list with prices
- Phone number input
- Summary before checkout
- Flutterwave integration

**Android Implementation:**

```kotlin
// DataPurchaseViewModel.kt
class DataPurchaseViewModel(
    private val dataPlanRepository: DataPlanRepository,
    private val transactionRepository: TransactionRepository,
    private val flutterwaveRepository: FlutterwaveRepository
) : ViewModel() {
    
    private val _plans = MutableStateFlow<Map<Network, List<DataPlan>>>(emptyMap())
    val plans = _plans.asStateFlow()
    
    private val _selectedNetwork = MutableStateFlow<Network>(Network.MTN)
    val selectedNetwork = _selectedNetwork.asStateFlow()
    
    private val _selectedPlan = MutableStateFlow<DataPlan?>(null)
    val selectedPlan = _selectedPlan.asStateFlow()
    
    private val _phoneNumber = MutableStateFlow("")
    val phoneNumber = _phoneNumber.asStateFlow()
    
    private val _checkoutState = MutableStateFlow<CheckoutUiState>(CheckoutUiState.Idle)
    val checkoutState = _checkoutState.asStateFlow()
    
    init {
        loadDataPlans()
    }
    
    fun loadDataPlans() {
        viewModelScope.launch {
            try {
                val allPlans = dataPlanRepository.getDataPlans()
                _plans.value = allPlans.groupBy { it.network }
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
    
    fun selectNetwork(network: Network) {
        _selectedNetwork.value = network
        _selectedPlan.value = null
    }
    
    fun selectPlan(plan: DataPlan) {
        _selectedPlan.value = plan
    }
    
    fun onPhoneChange(value: String) {
        _phoneNumber.value = value.filter { it.isDigit() }.take(11)
    }
    
    fun initiatePayment() {
        viewModelScope.launch {
            val plan = _selectedPlan.value ?: return@launch
            val phone = _phoneNumber.value
            
            if (phone.length != 11) {
                _checkoutState.value = CheckoutUiState.Error("Invalid phone number")
                return@launch
            }
            
            _checkoutState.value = CheckoutUiState.Loading
            
            try {
                val paymentResponse = transactionRepository.initiateDataPayment(
                    planId = plan.id,
                    phone = phone
                )
                
                // Launch Flutterwave payment
                _checkoutState.value = CheckoutUiState.PaymentReady(paymentResponse)
            } catch (e: Exception) {
                _checkoutState.value = CheckoutUiState.Error(e.message ?: "Failed to initiate payment")
            }
        }
    }
    
    fun handlePaymentResult(txRef: String, status: String) {
        viewModelScope.launch {
            if (status == "successful") {
                // Payment confirmed, data will be delivered by backend
                _checkoutState.value = CheckoutUiState.Success(txRef)
            } else {
                _checkoutState.value = CheckoutUiState.Error("Payment failed: $status")
            }
        }
    }
}

// DataPurchaseScreen.kt
@Composable
fun DataPurchaseScreen(viewModel: DataPurchaseViewModel) {
    val plans by viewModel.plans.collectAsState()
    val selectedNetwork by viewModel.selectedNetwork.collectAsState()
    val selectedPlan by viewModel.selectedPlan.collectAsState()
    val phoneNumber by viewModel.phoneNumber.collectAsState()
    val checkoutState by viewModel.checkoutState.collectAsState()
    
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        // Network tabs
        Row(modifier = Modifier.horizontalScroll(rememberScrollState())) {
            Network.values().forEach { network ->
                FilterChip(
                    selected = selectedNetwork == network,
                    onClick = { viewModel.selectNetwork(network) },
                    label = { Text(network.name) },
                    modifier = Modifier.padding(4.dp)
                )
            }
        }
        
        // Plans list
        LazyColumn {
            items(plans[selectedNetwork] ?: emptyList()) { plan ->
                DataPlanCard(
                    plan = plan,
                    isSelected = selectedPlan?.id == plan.id,
                    onClick = { viewModel.selectPlan(plan) }
                )
            }
        }
        
        // Phone input
        OutlinedTextField(
            value = phoneNumber,
            onValueChange = viewModel::onPhoneChange,
            label = { Text("Recipient Phone") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
        )
        
        // Checkout button
        when (checkoutState) {
            is CheckoutUiState.PaymentReady -> {
                LaunchedEffect(checkoutState) {
                    // Launch Flutterwave payment UI
                    launchFlutterwavePayment(checkoutState.paymentResponse)
                }
            }
            is CheckoutUiState.Success -> {
                Text("Payment successful! Data will be delivered shortly.")
            }
            is CheckoutUiState.Error -> {
                Text(checkoutState.message, color = Color.Red)
            }
            CheckoutUiState.Idle, CheckoutUiState.Loading -> {
                Button(
                    onClick = viewModel::initiatePayment,
                    enabled = selectedPlan != null && phoneNumber.length == 11,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    if (checkoutState is CheckoutUiState.Loading) {
                        CircularProgressIndicator(color = Color.White)
                    } else {
                        Text("Proceed to Payment")
                    }
                }
            }
        }
    }
}
```

### 4. **Store/eCommerce Screen**

**Current Web Implementation:**
- Product grid/list view
- Filter by category
- Search functionality
- "Add to Cart" button
- Cart management
- Checkout with shipping

**Android Implementation:**

```kotlin
// StoreViewModel.kt
class StoreViewModel(
    private val productRepository: ProductRepository,
    private val cartRepository: CartRepository,
    private val transactionRepository: TransactionRepository
) : ViewModel() {
    
    private val _products = MutableStateFlow<List<Product>>(emptyList())
    val products = _products.asStateFlow()
    
    private val _cartItems = MutableStateFlow<List<CartItem>>(emptyList())
    val cartItems = _cartItems.asStateFlow()
    
    private val _cartTotal = _cartItems.map { items ->
        items.sumOf { it.product.price * it.quantity }
    }.stateIn(viewModelScope, SharingStarted.Lazily, 0.0)
    val cartTotal = _cartTotal
    
    private val _selectedCategory = MutableStateFlow<String?>(null)
    val selectedCategory = _selectedCategory.asStateFlow()
    
    private val _searchQuery = MutableStateFlow("")
    val searchQuery = _searchQuery.asStateFlow()
    
    private val _filteredProducts = combine(
        _products,
        _selectedCategory,
        _searchQuery
    ) { products, category, query ->
        products
            .filter { category == null || it.category == category }
            .filter { query.isEmpty() || it.name.contains(query, ignoreCase = true) }
    }.stateIn(viewModelScope, SharingStarted.Lazily, emptyList())
    val filteredProducts = _filteredProducts
    
    init {
        loadProducts()
        loadCart()
    }
    
    fun loadProducts() {
        viewModelScope.launch {
            try {
                _products.value = productRepository.getProducts()
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
    
    fun loadCart() {
        viewModelScope.launch {
            _cartItems.value = cartRepository.getCartItems()
        }
    }
    
    fun addToCart(product: Product, quantity: Int = 1) {
        viewModelScope.launch {
            cartRepository.addItem(CartItem(product, quantity))
            loadCart()
        }
    }
    
    fun removeFromCart(productId: String) {
        viewModelScope.launch {
            cartRepository.removeItem(productId)
            loadCart()
        }
    }
    
    fun checkout(shippingAddress: String, customerPhone: String, customerName: String) {
        viewModelScope.launch {
            try {
                val response = transactionRepository.initiateCheckout(
                    items = _cartItems.value,
                    shippingAddress = shippingAddress,
                    phone = customerPhone,
                    customerName = customerName
                )
                // Navigate to payment
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
}
```

### 5. **Transaction History Screen**

**Current Web Implementation:**
- List of all user transactions
- Filter by status (pending, paid, delivered, failed)
- Search by reference
- Download receipt (PNG)
- Check pending status
- Sort by date

**Android Implementation:**

```kotlin
// HistoryViewModel.kt
class HistoryViewModel(
    private val transactionRepository: TransactionRepository
) : ViewModel() {
    
    private val _transactions = MutableStateFlow<List<Transaction>>(emptyList())
    val transactions = _transactions.asStateFlow()
    
    private val _selectedStatus = MutableStateFlow<TransactionStatus?>(null)
    val selectedStatus = _selectedStatus.asStateFlow()
    
    private val _searchQuery = MutableStateFlow("")
    val searchQuery = _searchQuery.asStateFlow()
    
    private val _filteredTransactions = combine(
        _transactions,
        _selectedStatus,
        _searchQuery
    ) { txns, status, query ->
        txns
            .filter { status == null || it.status == status }
            .filter { query.isEmpty() || it.txRef.contains(query, ignoreCase = true) }
            .sortedByDescending { it.createdAt }
    }.stateIn(viewModelScope, SharingStarted.Lazily, emptyList())
    
    val filteredTransactions = _filteredTransactions
    
    private val _checkingPendingId = MutableStateFlow<String?>(null)
    val checkingPendingId = _checkingPendingId.asStateFlow()
    
    fun loadTransactions(phone: String) {
        viewModelScope.launch {
            try {
                _transactions.value = transactionRepository.getTransactions(phone)
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
    
    fun filterByStatus(status: TransactionStatus?) {
        _selectedStatus.value = status
    }
    
    fun search(query: String) {
        _searchQuery.value = query
    }
    
    fun checkPendingStatus(txId: String) {
        viewModelScope.launch {
            _checkingPendingId.value = txId
            try {
                val updatedTx = transactionRepository.verifyTransaction(txId)
                // Update in list
                _transactions.value = _transactions.value.map {
                    if (it.id == txId) updatedTx else it
                }
            } catch (e: Exception) {
                // Handle error
            } finally {
                _checkingPendingId.value = null
            }
        }
    }
    
    fun downloadReceipt(transaction: Transaction): File {
        // Generate PDF receipt
        return transactionRepository.generateReceipt(transaction)
    }
}

// HistoryScreen.kt
@Composable
fun HistoryScreen(viewModel: HistoryViewModel) {
    val transactions by viewModel.filteredTransactions.collectAsState()
    val checkingPendingId by viewModel.checkingPendingId.collectAsState()
    val userPhone = getStoredPhone()
    
    LaunchedEffect(userPhone) {
        viewModel.loadTransactions(userPhone)
    }
    
    Column(modifier = Modifier.fillMaxSize()) {
        // Status filter chips
        Row(modifier = Modifier.horizontalScroll(rememberScrollState())) {
            TransactionStatus.values().forEach { status ->
                FilterChip(
                    selected = status == TransactionStatus.PENDING,
                    onClick = { viewModel.filterByStatus(status) },
                    label = { Text(status.displayName) }
                )
            }
        }
        
        // Transactions list
        LazyColumn {
            items(transactions) { tx ->
                TransactionCard(
                    transaction = tx,
                    isChecking = checkingPendingId == tx.id,
                    onCheckStatus = { viewModel.checkPendingStatus(tx.id) },
                    onDownloadReceipt = {
                        val receiptFile = viewModel.downloadReceipt(tx)
                        shareFile(receiptFile)
                    }
                )
            }
        }
    }
}
```

### 6. **Agent Portal (Premium Feature)**

**Current Web Implementation:**
- Agent registration
- PIN management
- Balance view
- Cashback tracking
- Withdrawal management
- Agent statistics

**Android Implementation:**

```kotlin
// AgentPortalViewModel.kt
class AgentPortalViewModel(
    private val agentRepository: AgentRepository,
    private val cashbackRepository: CashbackRepository,
    private val authRepository: AuthRepository
) : ViewModel() {
    
    private val _agent = MutableStateFlow<Agent?>(null)
    val agent = _agent.asStateFlow()
    
    private val _cashbackHistory = MutableStateFlow<List<CashbackEntry>>(emptyList())
    val cashbackHistory = _cashbackHistory.asStateFlow()
    
    private val _redeemState = MutableStateFlow<RedeemUiState>(RedeemUiState.Idle)
    val redeemState = _redeemState.asStateFlow()
    
    fun loadAgentData() {
        viewModelScope.launch {
            try {
                _agent.value = authRepository.getStoredAgent()
                val agentId = _agent.value?.id ?: return@launch
                _cashbackHistory.value = cashbackRepository.getCashbackHistory(agentId)
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
    
    fun redeemCashback(amount: Double) {
        viewModelScope.launch {
            val agentId = _agent.value?.id ?: return@launch
            _redeemState.value = RedeemUiState.Loading
            
            try {
                agentRepository.redeemCashback(
                    agentId = agentId,
                    amount = amount
                )
                _redeemState.value = RedeemUiState.Success
            } catch (e: Exception) {
                _redeemState.value = RedeemUiState.Error(e.message ?: "Redemption failed")
            }
        }
    }
    
    fun updatePin(oldPin: String, newPin: String) {
        viewModelScope.launch {
            val agentId = _agent.value?.id ?: return@launch
            
            try {
                agentRepository.updatePin(
                    agentId = agentId,
                    oldPin = oldPin,
                    newPin = newPin
                )
                // Show success
            } catch (e: Exception) {
                // Show error
            }
        }
    }
}
```

---

## API Integration

### REST Client Setup (Retrofit)

```kotlin
// ApiService.kt
interface SaukiMartApiService {
    
    // Agent endpoints
    @POST("api/agent/login")
    suspend fun agentLogin(@Body request: LoginRequest): LoginResponse
    
    @POST("api/agent/register")
    suspend fun agentRegister(@Body request: RegisterRequest): RegisterResponse
    
    @GET("api/agent/balance")
    suspend fun getAgentBalance(@Query("phone") phone: String): BalanceResponse
    
    @POST("api/agent/purchase")
    suspend fun agentPurchase(@Body request: PurchaseRequest): PurchaseResponse
    
    @POST("api/agent/update-pin")
    suspend fun updateAgentPin(@Body request: UpdatePinRequest): UpdatePinResponse
    
    @POST("api/agent/redeem-cashback")
    suspend fun redeemCashback(@Body request: RedeemRequest): RedeemResponse
    
    // Customer endpoints
    @GET("api/products")
    suspend fun getProducts(): List<Product>
    
    @GET("api/data-plans")
    suspend fun getDataPlans(): List<DataPlan>
    
    @POST("api/data/initiate-payment")
    suspend fun initiateDataPayment(@Body request: PaymentRequest): PaymentResponse
    
    @POST("api/ecommerce/pay")
    suspend fun initiateCheckout(@Body request: CheckoutRequest): CheckoutResponse
    
    @GET("api/transactions/list")
    suspend fun getTransactions(@Query("phone") phone: String): List<Transaction>
    
    @POST("api/transactions/verify")
    suspend fun verifyTransaction(@Body request: VerifyRequest): Transaction
    
    // Support
    @POST("api/support")
    suspend fun submitSupportTicket(@Body request: SupportRequest): SupportResponse
    
    // System
    @GET("api/system/message")
    suspend fun getSystemMessages(): List<SystemMessage>
    
    // Push subscriptions
    @POST("api/push-subscribe")
    suspend fun subscribeToPush(@Body request: PushSubscriptionRequest): SubscriptionResponse
}

// Hilt module
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    
    @Provides
    @Singleton
    fun provideHttpClient(): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor())
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            })
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
    }
    
    @Provides
    @Singleton
    fun provideRetrofit(httpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl("https://www.saukimart.online/")
            .client(httpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    
    @Provides
    @Singleton
    fun provideSaukiMartApiService(retrofit: Retrofit): SaukiMartApiService {
        return retrofit.create(SaukiMartApiService::class.java)
    }
}

// Auth interceptor for token injection
class AuthInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        val token = AuthRepository.getStoredToken() // Your token storage
        
        val requestWithAuth = if (token != null) {
            originalRequest.newBuilder()
                .header("Authorization", "Bearer $token")
                .build()
        } else {
            originalRequest
        }
        
        return chain.proceed(requestWithAuth)
    }
}
```

---

## Database Considerations

### Local Database (Room)

**Why:** Offline capability and faster reads for cached data

```kotlin
// Room database schema mirroring backend

@Entity(tableName = "products")
data class ProductEntity(
    @PrimaryKey val id: String,
    val name: String,
    val description: String,
    val price: Double,
    val imageUrl: String,
    val inStock: Boolean,
    val category: String,
    val syncedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "data_plans")
data class DataPlanEntity(
    @PrimaryKey val id: String,
    val network: String,
    val data: String,
    val validity: String,
    val price: Double,
    val planId: Int,
    val syncedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "transactions")
data class TransactionEntity(
    @PrimaryKey val id: String,
    val txRef: String,
    val type: String,
    val status: String,
    val phone: String,
    val amount: Double,
    val createdAt: Long,
    val productId: String?,
    val planId: String?,
    val customerName: String?,
    val deliveryState: String?,
    val paymentData: String?, // JSON string
    val deliveryData: String?, // JSON string
    val syncedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "push_subscriptions")
data class PushSubscriptionEntity(
    @PrimaryKey val id: String,
    val endpoint: String,
    val p256dh: String,
    val auth: String,
    val phone: String?,
    val createdAt: Long = System.currentTimeMillis()
)

@Dao
interface TransactionDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTransaction(transaction: TransactionEntity)
    
    @Query("SELECT * FROM transactions WHERE phone = :phone ORDER BY createdAt DESC")
    fun getTransactionsByPhone(phone: String): Flow<List<TransactionEntity>>
    
    @Query("SELECT * FROM transactions WHERE status = :status")
    fun getTransactionsByStatus(status: String): Flow<List<TransactionEntity>>
    
    @Update
    suspend fun updateTransaction(transaction: TransactionEntity)
}

@Database(
    entities = [
        ProductEntity::class,
        DataPlanEntity::class,
        TransactionEntity::class,
        PushSubscriptionEntity::class
    ],
    version = 1,
    exportSchema = true
)
abstract class SaukiMartDatabase : RoomDatabase() {
    abstract fun productDao(): ProductDao
    abstract fun dataPlanDao(): DataPlanDao
    abstract fun transactionDao(): TransactionDao
    abstract fun pushSubscriptionDao(): PushSubscriptionDao
}

// Hilt Database Module
@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): SaukiMartDatabase {
        return Room.databaseBuilder(
            context,
            SaukiMartDatabase::class.java,
            "sauki_mart_db"
        )
            .addMigrations(/* define migrations */)
            .build()
    }
}
```

### Data Synchronization Strategy

```kotlin
// WorkManager for background sync
class TransactionSyncWorker(
    context: Context,
    params: WorkerParameters,
    private val transactionRepository: TransactionRepository
) : CoroutineWorker(context, params) {
    
    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            // Sync local pending transactions with server
            transactionRepository.syncPendingTransactions()
            Result.success()
        } catch (e: Exception) {
            if (runAttemptCount < MAX_RETRIES) {
                Result.retry()
            } else {
                Result.failure()
            }
        }
    }
    
    companion object {
        private const val MAX_RETRIES = 3
        
        fun enqueue(context: Context) {
            val syncRequest = PeriodicWorkRequestBuilder<TransactionSyncWorker>(
                15, TimeUnit.MINUTES
            ).build()
            
            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                "transaction_sync",
                ExistingPeriodicWorkPolicy.KEEP,
                syncRequest
            )
        }
    }
}
```

---

## Authentication & Security

### Secure Token Storage

```kotlin
// DataStore for secure preference storage
@Singleton
class AuthRepository(
    private val context: Context,
    private val apiService: SaukiMartApiService
) {
    
    private val dataStore = context.createDataStore(
        name = "sauki_auth",
        serializer = AuthPreferencesSerializer
    )
    
    val authToken: Flow<String?> = dataStore.data.map { it.token }
    val agentData: Flow<Agent?> = dataStore.data.map { it.agent?.toDomain() }
    
    suspend fun saveAuthToken(token: String) {
        dataStore.updateData { preferences ->
            preferences.copy(token = token)
        }
    }
    
    suspend fun saveAgentData(agent: Agent) {
        dataStore.updateData { preferences ->
            preferences.copy(agent = agent.toProto())
        }
    }
    
    suspend fun logout() {
        dataStore.updateData { AuthPreferences.getDefaultInstance() }
    }
}

// PIN hashing for local verification
object PinManager {
    fun hashPin(pin: String): String {
        return MessageDigest.getInstance("SHA-256")
            .digest(pin.toByteArray())
            .fold("") { str, it -> str + "%02x".format(it) }
    }
    
    fun verifyPin(pin: String, hash: String): Boolean {
        return hashPin(pin) == hash
    }
}

// Biometric authentication (optional but recommended)
@Composable
fun BiometricLoginScreen(viewModel: BiometricAuthViewModel) {
    val biometricPrompt = BiometricPrompt(
        activity,
        ContextCompat.getMainExecutor(context),
        object : BiometricPrompt.AuthenticationCallback() {
            override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                viewModel.onBiometricSuccess()
            }
            
            override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                viewModel.onBiometricError(errString.toString())
            }
        }
    )
    
    LaunchedEffect(Unit) {
        val promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle("Unlock Sauki Mart")
            .setSubtitle("Use your biometric")
            .setNegativeButtonText("Cancel")
            .build()
        
        biometricPrompt.authenticate(promptInfo)
    }
}
```

### Request Signing & Verification

```kotlin
// For agent operations, use PIN as verification
class PinVerifiedRequest(
    val action: String,
    val data: Map<String, Any>,
    val pinHash: String, // Client-side hash
    val timestamp: Long
) {
    fun toJson(): String = Gson().toJson(this)
}

// API request interceptor
class PinVerificationInterceptor(
    private val pinManager: PinManager,
    private val userPin: String
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()
        
        // Only add for sensitive operations
        if (original.header("X-Requires-PIN") == "true") {
            val timestamp = System.currentTimeMillis()
            val signature = createSignature(userPin, timestamp)
            
            val request = original.newBuilder()
                .header("X-PIN-Signature", signature)
                .header("X-Timestamp", timestamp.toString())
                .build()
            
            return chain.proceed(request)
        }
        
        return chain.proceed(original)
    }
    
    private fun createSignature(pin: String, timestamp: Long): String {
        val data = "$pin$timestamp"
        return MessageDigest.getInstance("SHA-256")
            .digest(data.toByteArray())
            .fold("") { str, it -> str + "%02x".format(it) }
    }
}
```

---

## UI/UX Implementation

### Navigation Structure

```kotlin
// Navigation graph
@Composable
fun SaukiMartNavigation(navController: NavHostController) {
    NavHost(
        navController = navController,
        startDestination = if (isLoggedIn()) "home" else "login"
    ) {
        composable("login") { AgentLoginScreen() }
        composable("register") { AgentRegisterScreen() }
        
        composable("home") { HomeScreen() }
        composable("data") { DataPurchaseScreen() }
        composable("store") { StoreScreen() }
        composable("agent") { AgentPortalScreen() }
        composable("history") { HistoryScreen() }
        
        composable(
            route = "transaction_detail/{txId}",
            arguments = listOf(navArgument("txId") { type = NavType.StringType })
        ) { backStackEntry ->
            TransactionDetailScreen(txId = backStackEntry.arguments?.getString("txId"))
        }
        
        composable("admin") { AdminDashboard() }
    }
}
```

### Bottom Tab Navigation

```kotlin
@Composable
fun SaukiMartApp() {
    val navController = rememberNavController()
    val currentBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = currentBackStackEntry?.destination
    
    Scaffold(
        bottomBar = {
            if (shouldShowBottomBar(currentDestination)) {
                NavigationBar {
                    Tab(
                        label = "Home",
                        icon = Icons.Default.Home,
                        selected = currentDestination?.route == "home",
                        onClick = { navController.navigate("home") }
                    )
                    Tab(
                        label = "Data",
                        icon = Icons.Default.DataUsage,
                        selected = currentDestination?.route == "data",
                        onClick = { navController.navigate("data") }
                    )
                    Tab(
                        label = "Store",
                        icon = Icons.Default.Shop,
                        selected = currentDestination?.route == "store",
                        onClick = { navController.navigate("store") }
                    )
                    Tab(
                        label = "Agent",
                        icon = Icons.Default.Person,
                        selected = currentDestination?.route == "agent",
                        onClick = { navController.navigate("agent") }
                    )
                    Tab(
                        label = "History",
                        icon = Icons.Default.History,
                        selected = currentDestination?.route == "history",
                        onClick = { navController.navigate("history") }
                    )
                }
            }
        }
    ) { innerPadding ->
        SaukiMartNavigation(navController, modifier = Modifier.padding(innerPadding))
    }
}
```

### Theming

```kotlin
// Material 3 theming
@Composable
fun SaukiMartTheme(content: @Composable () -> Unit) {
    val colorScheme = lightColorScheme(
        primary = Color(0xFF2196F3),
        onPrimary = Color.White,
        secondary = Color(0xFFFFC107),
        surface = Color.White,
        error = Color(0xFFF44336)
    )
    
    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography(
            headlineLarge = TextStyle(
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold
            ),
            bodyLarge = TextStyle(
                fontSize = 16.sp,
                fontWeight = FontWeight.Normal
            )
        ),
        content = content
    )
}
```

---

## Push Notifications

### Firebase Cloud Messaging Setup

```kotlin
// Firebase messaging service
class SaukiMartMessagingService : FirebaseMessagingService() {
    
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        
        // Send token to backend
        viewModelScope.launch {
            try {
                apiService.subscribeToPush(
                    PushSubscriptionRequest(
                        subscription = PushSubscription(
                            endpoint = "fcm:$token",
                            p256dh = "",
                            auth = ""
                        ),
                        phone = getStoredPhone()
                    )
                )
            } catch (e: Exception) {
                Log.e("FCM", "Failed to send token to server", e)
            }
        }
    }
    
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        
        val notificationData = remoteMessage.data
        val title = notificationData["title"] ?: "Sauki Mart"
        val body = notificationData["body"] ?: ""
        val url = notificationData["url"] ?: "/"
        
        showNotification(title, body, url)
    }
    
    private fun showNotification(title: String, body: String, url: String) {
        val channelId = "sauki_mart_channel"
        
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("url", url)
        }
        
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle(title)
            .setContentText(body)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .build()
        
        NotificationManagerCompat.from(this).notify(1001, notification)
    }
}

// Create notification channel (in Application class)
class SaukiMartApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        createNotificationChannels()
    }
    
    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "sauki_mart_channel",
                "Sauki Mart Notifications",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications about your orders and wallet"
            }
            
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }
}
```

---

## Payment Integration

### Flutterwave SDK Integration

```kotlin
// Flutterwave payment handler
class FlutterwavePaymentHandler(
    context: Context,
    private val flutterwaveRepository: FlutterwaveRepository
) {
    
    fun initiateDataPayment(
        amount: Double,
        phone: String,
        narration: String,
        onSuccess: (txRef: String) -> Unit,
        onError: (message: String) -> Unit
    ) {
        val flw = Flutterwave.getInstance()
        flw.context = context
        
        val request = ChargeRequest().apply {
            email = "customer@saukimart.com"
            phoneNumber = phone
            amount = amount.toString()
            narration = narration
            currency = "NGN"
            txRef = "SAUKI-${System.currentTimeMillis()}"
            
            // Bank transfer
            isChargeBank = true
        }
        
        flw.requestHandler(
            context,
            request,
            object : AvailabilityCheckListener {
                override fun onAvailabilityCheckStarted() {}
                
                override fun onAvailabilityCheckSuccessful(s: String) {
                    // Payment available
                }
                
                override fun onAvailabilityCheckFailed(s: String) {
                    onError(s)
                }
            },
            object : FlutterwaveCallback {
                override fun onSuccessfulInitialization(flutterwaveEncryptedData: FlutterwaveEncryptedData) {
                    // Data encrypted successfully
                }
                
                override fun onFailedInitialization(s: String) {
                    onError("Initialization failed: $s")
                }
                
                override fun onNothingToEncrypt() {
                    onError("Encryption failed")
                }
                
                override fun onFlutterwaveUiClose() {}
            }
        )
    }
    
    fun handlePaymentResponse(response: TransactionResponse) {
        if (response.status == "successful") {
            // Verify payment server-side
            viewModelScope.launch {
                try {
                    flutterwaveRepository.verifyPayment(response.txRef)
                    onSuccess(response.txRef)
                } catch (e: Exception) {
                    onError("Verification failed: ${e.message}")
                }
            }
        } else {
            onError("Payment failed: ${response.status}")
        }
    }
}
```

---

## Data Persistence

### Offline-First Architecture

```kotlin
// Repository pattern with local/remote fallback
class TransactionRepository(
    private val apiService: SaukiMartApiService,
    private val database: SaukiMartDatabase,
    private val networkConnectivity: NetworkConnectivity
) {
    
    fun getTransactions(phone: String): Flow<List<Transaction>> = flow {
        // Emit cached data first
        val cached = database.transactionDao()
            .getTransactionsByPhone(phone)
            .firstOrNull() ?: emptyList()
        emit(cached.map { it.toDomain() })
        
        // Try to fetch fresh data
        if (networkConnectivity.isConnected()) {
            try {
                val fresh = apiService.getTransactions(phone)
                // Update local database
                fresh.forEach { tx ->
                    database.transactionDao().insertTransaction(tx.toEntity())
                }
                emit(fresh)
            } catch (e: Exception) {
                Log.e("TransactionRepository", "Failed to fetch remote data", e)
                // Continue with cached data
            }
        }
    }
    
    suspend fun initiatePayment(request: PaymentRequest): PaymentResponse {
        return if (networkConnectivity.isConnected()) {
            val response = apiService.initiateDataPayment(request)
            // Cache the pending transaction
            database.transactionDao().insertTransaction(
                TransactionEntity(
                    id = UUID.randomUUID().toString(),
                    txRef = response.txRef,
                    type = "data",
                    status = "pending",
                    phone = request.phone,
                    amount = request.amount,
                    planId = request.planId,
                    createdAt = System.currentTimeMillis()
                )
            )
            response
        } else {
            throw NetworkException("No internet connection")
        }
    }
}

// Network connectivity monitoring
@Singleton
class NetworkConnectivity(context: Context) {
    private val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE)
        as ConnectivityManager
    
    fun isConnected(): Boolean {
        val network = connectivityManager.activeNetwork ?: return false
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
        
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }
    
    fun observeConnectivity(): Flow<Boolean> = callbackFlow {
        val callback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                trySend(true)
            }
            
            override fun onLost(network: Network) {
                trySend(false)
            }
        }
        
        connectivityManager.registerDefaultNetworkCallback(callback)
        
        awaitClose { connectivityManager.unregisterNetworkCallback(callback) }
    }
}
```

---

## Performance & Optimization

### Image Loading & Caching

```kotlin
// Coil configuration for efficient image loading
@Module
@InstallIn(SingletonComponent::class)
object ImageLoadingModule {
    
    @Provides
    @Singleton
    fun provideImageLoader(context: Context): ImageLoader {
        return ImageLoader.Builder(context)
            .crossfade(true)
            .diskCachePolicy(CachePolicy.ENABLED)
            .memoryCachePolicy(CachePolicy.ENABLED)
            .placeholder(R.drawable.placeholder)
            .error(R.drawable.error)
            .build()
    }
}

// Usage in Composable
@Composable
fun ProductImage(imageUrl: String) {
    val painter = rememberAsyncImagePainter(
        model = imageUrl,
        contentScale = ContentScale.Crop
    )
    
    Image(
        painter = painter,
        contentDescription = null,
        modifier = Modifier
            .size(200.dp)
            .clip(RoundedCornerShape(8.dp)),
        contentScale = ContentScale.Crop
    )
}
```

### Lazy Loading & Pagination

```kotlin
// Paginated transaction list
class PaginatedTransactionViewModel(
    private val transactionRepository: TransactionRepository
) : ViewModel() {
    
    private val pageSize = 20
    private var currentPage = 0
    
    private val _transactions = MutableStateFlow<List<Transaction>>(emptyList())
    val transactions = _transactions.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading = _isLoading.asStateFlow()
    
    private val _hasMorePages = MutableStateFlow(true)
    val hasMorePages = _hasMorePages.asStateFlow()
    
    fun loadMore(phone: String) {
        if (!_isLoading.value && _hasMorePages.value) {
            viewModelScope.launch {
                _isLoading.value = true
                try {
                    val newTransactions = transactionRepository
                        .getTransactionsPaginated(
                            phone = phone,
                            page = currentPage,
                            pageSize = pageSize
                        )
                    
                    _transactions.value += newTransactions
                    _hasMorePages.value = newTransactions.size == pageSize
                    currentPage++
                } finally {
                    _isLoading.value = false
                }
            }
        }
    }
}

// Composable with lazy column
@Composable
fun TransactionList(viewModel: PaginatedTransactionViewModel) {
    val transactions by viewModel.transactions.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val hasMorePages by viewModel.hasMorePages.collectAsState()
    
    LazyColumn {
        items(
            items = transactions,
            key = { it.id }
        ) { transaction ->
            TransactionCard(transaction)
        }
        
        if (hasMorePages) {
            item {
                LaunchedEffect(Unit) {
                    viewModel.loadMore(getStoredPhone())
                }
                
                if (isLoading) {
                    Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator()
                    }
                }
            }
        }
    }
}
```

---

## Testing Strategy

### Unit Tests

```kotlin
// Agent login viewmodel test
@RunWith(RobolectricTestRunner::class)
class AgentLoginViewModelTest {
    
    private lateinit var viewModel: AgentLoginViewModel
    private val agentRepository = mockk<AgentRepository>()
    private val authRepository = mockk<AuthRepository>()
    
    @Before
    fun setup() {
        viewModel = AgentLoginViewModel(agentRepository, authRepository)
    }
    
    @Test
    fun testSuccessfulLogin() = runTest {
        val mockAgent = Agent(
            id = "agent-1",
            firstName = "John",
            phone = "08012345678",
            balance = 1000.0
        )
        val mockResponse = LoginResponse(token = "token-123", agent = mockAgent)
        
        coEvery { agentRepository.login(any(), any()) } returns mockResponse
        coEvery { authRepository.saveToken(any()) } returns Unit
        
        viewModel.onPhoneChange("08012345678")
        viewModel.onPinChange("1234")
        viewModel.login()
        
        val loginState = viewModel.loginState.first()
        assertTrue(loginState is LoginUiState.Success)
        assertEquals(mockAgent.id, (loginState as LoginUiState.Success).agent.id)
    }
    
    @Test
    fun testInvalidPin() = runTest {
        coEvery { agentRepository.login(any(), any()) } throws HttpException(
            Response.error<Unit>(401, ResponseBody.create(null, "Invalid PIN"))
        )
        
        viewModel.onPhoneChange("08012345678")
        viewModel.onPinChange("0000")
        viewModel.login()
        
        val loginState = viewModel.loginState.first()
        assertTrue(loginState is LoginUiState.Error)
    }
}

// Transaction repository test
@RunWith(JUnit4::class)
class TransactionRepositoryTest {
    
    private lateinit var repository: TransactionRepository
    private val apiService = mockk<SaukiMartApiService>()
    private val database = mockk<SaukiMartDatabase>()
    private val connectivity = mockk<NetworkConnectivity>()
    
    @Before
    fun setup() {
        repository = TransactionRepository(apiService, database, connectivity)
    }
    
    @Test
    fun testOfflineTransactionFetch() = runTest {
        val mockTxns = listOf(
            TransactionEntity("1", "TX-001", "data", "pending", "08012345678", 500.0, System.currentTimeMillis())
        )
        
        coEvery { database.transactionDao().getTransactionsByPhone("08012345678") }
            .returns(flowOf(mockTxns))
        coEvery { connectivity.isConnected() } returns false
        
        val result = repository.getTransactions("08012345678").first()
        
        assertEquals(1, result.size)
    }
}
```

### Integration Tests

```kotlin
// API integration test with MockWebServer
@RunWith(AndroidJUnit4::class)
class ApiServiceIntegrationTest {
    
    @get:Rule
    val instantExecutorRule = InstantTaskExecutorRule()
    
    private lateinit var mockWebServer: MockWebServer
    private lateinit var apiService: SaukiMartApiService
    
    @Before
    fun setup() {
        mockWebServer = MockWebServer()
        mockWebServer.start()
        
        val retrofit = Retrofit.Builder()
            .baseUrl(mockWebServer.url("/"))
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        
        apiService = retrofit.create(SaukiMartApiService::class.java)
    }
    
    @After
    fun tearDown() {
        mockWebServer.shutdown()
    }
    
    @Test
    fun testAgentLoginSuccess() = runTest {
        mockWebServer.enqueue(
            MockResponse()
                .setBody("""{"token":"abc123","agent":{"id":"1","firstName":"John","balance":1000}}""")
                .setResponseCode(200)
        )
        
        val response = apiService.agentLogin(LoginRequest("08012345678", "1234"))
        
        assertEquals("abc123", response.token)
        assertEquals("John", response.agent.firstName)
    }
}
```

---

## Deployment Pipeline

### Build Configuration

```kotlin
// build.gradle.kts
plugins {
    id("com.android.application")
    kotlin("android")
    kotlin("kapt")
    id("com.google.dagger.hilt.android")
}

android {
    namespace = "com.saukimart"
    compileSdk = 34
    
    defaultConfig {
        applicationId = "com.saukimart"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
        
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }
    
    buildTypes {
        debug {
            buildConfigField("String", "API_BASE_URL", "\"https://dev-api.saukimart.online/\"")
            buildConfigField("String", "FLUTTERWAVE_KEY", "\"pk_test_xxx\"")
        }
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            buildConfigField("String", "API_BASE_URL", "\"https://www.saukimart.online/\"")
            buildConfigField("String", "FLUTTERWAVE_KEY", "\"pk_live_xxx\"")
        }
    }
    
    buildFeatures {
        compose = true
    }
    
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.3"
    }
}

dependencies {
    // Core
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    
    // Compose
    implementation(platform("androidx.compose:compose-bom:2023.10.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.activity:activity-compose:1.8.0")
    
    // Navigation
    implementation("androidx.navigation:navigation-compose:2.7.2")
    
    // Networking
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:okhttp:4.11.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.11.0")
    
    // Database
    implementation("androidx.room:room-runtime:2.6.0")
    kapt("androidx.room:room-compiler:2.6.0")
    implementation("androidx.room:room-ktx:2.6.0")
    
    // DataStore
    implementation("androidx.datastore:datastore-preferences:1.0.0")
    
    // Dependency Injection
    implementation("com.google.dagger:hilt-android:2.48")
    kapt("com.google.dagger:hilt-compiler:2.48")
    
    // Firebase
    implementation(platform("com.google.firebase:firebase-bom:32.4.1"))
    implementation("com.google.firebase:firebase-messaging")
    implementation("com.google.firebase:firebase-analytics")
    
    // Image loading
    implementation("io.coil-kt:coil-compose:2.4.0")
    
    // Work Manager
    implementation("androidx.work:work-runtime-ktx:2.8.1")
    
    // Biometric
    implementation("androidx.biometric:biometric:1.1.0")
    
    // Testing
    testImplementation("junit:junit:4.13.2")
    testImplementation("io.mockk:mockk:1.13.8")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation("com.squareup.okhttp3:mockwebserver:4.11.0")
}
```

### Release Checklist

- [ ] Update version code and version name
- [ ] Create signed APK/AAB with release keystore
- [ ] Run full test suite (unit + integration + E2E)
- [ ] Check for crashes with Crashlytics
- [ ] Test on minimum API level device (API 24)
- [ ] Verify all APIs working against production
- [ ] Test payment flow end-to-end
- [ ] Check notification delivery
- [ ] Verify offline functionality
- [ ] Build signed APK
- [ ] Test on Firebase Test Lab
- [ ] Upload to Google Play Store (staged rollout)
- [ ] Monitor crash reports

---

## Key Differences: Web vs Native Android

| Feature | Web PWA | Android App |
|---------|---------|------------|
| Performance | Good (2-3s load) | Excellent (< 1s) |
| Offline | Service Worker | SQLite + WorkManager |
| Notifications | Web Push | Firebase Cloud Messaging |
| Authentication | Token in localStorage | DataStore (encrypted) |
| Payment | Flutterwave Web | Flutterwave SDK |
| Storage | IndexedDB | Room Database |
| Background Sync | Service Worker | WorkManager |
| Push Subscription | Web Push API | Firebase Token |
| UX | Responsive Web | Native Material Design |
| Installation | Browser | Google Play Store |

---

## Migration Path

### Phase 1: MVP (3-4 months)
- Core authentication (agent login)
- Home screen with balances
- Data purchase flow
- Transaction history
- Basic push notifications

### Phase 2: Enhanced (2-3 months)
- eCommerce store
- Product checkout
- Admin dashboard
- Offline support
- Biometric authentication

### Phase 3: Polish (1-2 months)
- Performance optimization
- Advanced caching strategies
- Analytics integration
- A/B testing framework
- Widget support

---

## Conclusion

This comprehensive guide provides a roadmap for converting Sauki Mart's web PWA into a native Android application. The key principles are:

1. **Maintain API contracts** - Reuse existing backend APIs
2. **Implement offline-first** - Use Room + WorkManager
3. **Leverage native capabilities** - Biometrics, notifications, camera
4. **Follow Android best practices** - MVVM, dependency injection, coroutines
5. **Test thoroughly** - Unit, integration, and E2E tests

With this architecture, you can build a performant, reliable Android app that matches the functionality of your web platform while providing superior user experience through native integration.

Good luck with your Android development journey! 🚀
