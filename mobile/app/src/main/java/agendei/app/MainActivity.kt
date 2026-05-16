package agendei.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.rounded.Dashboard
import androidx.compose.material.icons.rounded.Event
import androidx.compose.material.icons.rounded.Payments
import androidx.compose.material.icons.rounded.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import agendei.app.ui.screens.*
import agendei.app.ui.theme.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            val isDark = isSystemInDarkTheme()
            val colorScheme = if (isDark) {
                darkColorScheme(primary = Primary, background = BackgroundDark, surface = CardDark, onBackground = TextDark, onSurface = TextDark)
            } else {
                lightColorScheme(primary = Primary, background = BackgroundLight, surface = CardLight, onBackground = TextLight, onSurface = TextLight)
            }

            MaterialTheme(colorScheme = colorScheme) {
                MainContent()
            }
        }
    }
}

@Composable
fun MainContent() {
    var authState by remember { mutableStateOf("login") }
    var currentScreen by remember { mutableStateOf("home") }

    Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
        when (authState) {
            "login" -> LoginScreen(onLoginSuccess = { authState = "main" }, onNavigateToSignup = { authState = "signup" })
            "signup" -> SignupScreen(onSignupSuccess = { authState = "main" }, onNavigateToLogin = { authState = "login" })
            "main" -> {
                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    floatingActionButton = {
                        FloatingActionButton(
                            onClick = { },
                            containerColor = Primary,
                            contentColor = BackgroundDark,
                            shape = CircleShape,
                            modifier = Modifier.offset(y = 40.dp)
                        ) {
                            Icon(Icons.Default.Add, contentDescription = "Novo Corte")
                        }
                    },
                    floatingActionButtonPosition = FabPosition.Center,
                    bottomBar = {
                        FloatingTabBar(currentScreen = currentScreen, onTabSelected = { currentScreen = it })
                    }
                ) { paddingValues ->
                    Box(modifier = Modifier.fillMaxSize().padding(paddingValues)) {
                        when (currentScreen) {
                            "home" -> DashboardScreen()
                            "agenda" -> AgendaScreen()
                            "finances" -> FinanceScreen()
                            "settings" -> SettingsScreen()
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun FloatingTabBar(currentScreen: String, onTabSelected: (String) -> Unit) {
    Box(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp, vertical = 20.dp),
        contentAlignment = Alignment.BottomCenter
    ) {
        Surface(
            modifier = Modifier.height(64.dp).fillMaxWidth().clip(RoundedCornerShape(32.dp)),
            color = MaterialTheme.colorScheme.surface.copy(alpha = 0.95f),
            shadowElevation = 8.dp,
            border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.1f))
        ) {
            Row(
                modifier = Modifier.fillMaxSize(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                TabItem(icon = Icons.Rounded.Dashboard, label = "Home", isSelected = currentScreen == "home") { onTabSelected("home") }
                TabItem(icon = Icons.Rounded.Event, label = "Agenda", isSelected = currentScreen == "agenda") { onTabSelected("agenda") }
                Spacer(modifier = Modifier.width(48.dp))
                TabItem(icon = Icons.Rounded.Payments, label = "Finanças", isSelected = currentScreen == "finances") { onTabSelected("finances") }
                TabItem(icon = Icons.Rounded.Settings, label = "Ajustes", isSelected = currentScreen == "settings") { onTabSelected("settings") }
            }
        }
    }
}

@Composable
fun TabItem(icon: ImageVector, label: String, isSelected: Boolean, onClick: () -> Unit) {
    IconButton(onClick = onClick) {
        Icon(icon, label, tint = if (isSelected) Primary else MutedDark, modifier = Modifier.size(26.dp))
    }
}
