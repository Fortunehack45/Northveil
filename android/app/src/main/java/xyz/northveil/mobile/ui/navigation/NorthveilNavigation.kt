package xyz.northveil.mobile.ui.navigation

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import kotlinx.coroutines.launch
import xyz.northveil.mobile.ui.agents.AgentsScreen
import xyz.northveil.mobile.ui.agents.AgentsViewModel
import xyz.northveil.mobile.ui.approvals.ApprovalsScreen
import xyz.northveil.mobile.ui.approvals.ApprovalsViewModel
import xyz.northveil.mobile.ui.auth.AuthScreen
import xyz.northveil.mobile.ui.auth.AuthViewModel
import xyz.northveil.mobile.ui.developerhub.DeveloperHubScreen
import xyz.northveil.mobile.ui.lock.LockScreen
import xyz.northveil.mobile.ui.lock.LockViewModel
import xyz.northveil.mobile.ui.modals.ReceiveBottomSheet
import xyz.northveil.mobile.ui.modals.SendBottomSheet
import xyz.northveil.mobile.ui.overview.OverviewScreen
import xyz.northveil.mobile.ui.overview.OverviewViewModel
import xyz.northveil.mobile.ui.profile.ProfileScreen
import xyz.northveil.mobile.ui.profile.ProfileViewModel
import xyz.northveil.mobile.ui.wallets.WalletsScreen
import xyz.northveil.mobile.ui.wallets.WalletsViewModel

sealed class Screen(val route: String) {
    object Auth : Screen("auth")
    object Lock : Screen("lock")
    object Main : Screen("main")
    object Approvals : Screen("approvals")
    object DeveloperHub : Screen("developer_hub")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NorthveilNavigation(
    isVaultConfigured: Boolean
) {
    val navController = rememberNavController()
    val startDestination = if (isVaultConfigured) Screen.Lock.route else Screen.Auth.route
    val colorScheme = MaterialTheme.colorScheme

    NavHost(
        navController = navController,
        startDestination = startDestination,
        modifier = Modifier.background(colorScheme.background)
    ) {
        composable(Screen.Auth.route) {
            val authViewModel: AuthViewModel = hiltViewModel()
            AuthScreen(
                viewModel = authViewModel,
                onAuthSuccess = {
                    navController.navigate(Screen.Main.route) {
                        popUpTo(Screen.Auth.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.Lock.route) {
            val lockViewModel: LockViewModel = hiltViewModel()
            LockScreen(
                viewModel = lockViewModel,
                onUnlocked = {
                    navController.navigate(Screen.Main.route) {
                        popUpTo(Screen.Lock.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.Main.route) {
            MainContainerScreen(
                onOpenApprovals = { navController.navigate(Screen.Approvals.route) },
                onOpenDeveloperHub = { navController.navigate(Screen.DeveloperHub.route) },
                onLockApp = {
                    navController.navigate(Screen.Lock.route) {
                        popUpTo(Screen.Main.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.Approvals.route) {
            val approvalsViewModel: ApprovalsViewModel = hiltViewModel()
            ApprovalsScreen(
                viewModel = approvalsViewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.DeveloperHub.route) {
            DeveloperHubScreen(
                onBack = { navController.popBackStack() }
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainContainerScreen(
    onOpenApprovals: () -> Unit,
    onOpenDeveloperHub: () -> Unit,
    onLockApp: () -> Unit
) {
    var currentTab by remember { mutableStateOf(NavTab.OVERVIEW) }
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    val colorScheme = MaterialTheme.colorScheme

    var showSendSheet by remember { mutableStateOf(false) }
    var showReceiveSheet by remember { mutableStateOf(false) }

    val overviewViewModel: OverviewViewModel = hiltViewModel()
    val walletsViewModel: WalletsViewModel = hiltViewModel()
    val agentsViewModel: AgentsViewModel = hiltViewModel()
    val profileViewModel: ProfileViewModel = hiltViewModel()

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            NorthveilDrawerContent(
                onItemSelected = { item ->
                    when (item) {
                        DrawerItem.APPROVALS -> onOpenApprovals()
                        DrawerItem.DEVELOPER_HUB -> onOpenDeveloperHub()
                        DrawerItem.TOUR -> {}
                    }
                },
                onCloseDrawer = { scope.launch { drawerState.close() } }
            )
        }
    ) {
        Scaffold(
            bottomBar = {
                NorthveilFloatingBottomBar(
                    currentTab = currentTab,
                    onTabSelected = { currentTab = it }
                )
            },
            containerColor = colorScheme.background
        ) { innerPadding ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
            ) {
                when (currentTab) {
                    NavTab.OVERVIEW -> OverviewScreen(
                        viewModel = overviewViewModel,
                        onOpenSend = { showSendSheet = true },
                        onOpenReceive = { showReceiveSheet = true },
                        onOpenDeposit = { showReceiveSheet = true },
                        onOpenApprovals = onOpenApprovals,
                        onOpenDrawer = { scope.launch { drawerState.open() } },
                        onTokenClick = {}
                    )
                    NavTab.WALLETS -> WalletsScreen(
                        viewModel = walletsViewModel,
                        onOpenCreateAccount = { walletsViewModel.createNewAccount("Account ${System.currentTimeMillis() % 100}") },
                        onOpenImportAccount = {},
                        onOpenDeposit = { showReceiveSheet = true }
                    )
                    NavTab.AGENTS -> AgentsScreen(
                        viewModel = agentsViewModel,
                        onConnectClaude = { agentsViewModel.connectAgent("Claude Desktop", "claude", 500.0, 60) },
                        onConnectChatGPT = { agentsViewModel.connectAgent("ChatGPT Agent", "chatgpt", 250.0, 30) },
                        onConnectCustom = { agentsViewModel.connectAgent("Custom AI Agent", "custom", 100.0, 15) }
                    )
                    NavTab.PROFILE -> ProfileScreen(
                        viewModel = profileViewModel,
                        onLockApp = onLockApp
                    )
                }

                if (showSendSheet) {
                    SendBottomSheet(
                        onDismiss = { showSendSheet = false },
                        onLaunchQrScanner = {},
                        onConfirmSend = { _, _, _ -> }
                    )
                }

                if (showReceiveSheet) {
                    ReceiveBottomSheet(
                        walletAddress = "0x71C8891575B50D22e032d847847C234A413D4Cc8",
                        onDismiss = { showReceiveSheet = false }
                    )
                }
            }
        }
    }
}
