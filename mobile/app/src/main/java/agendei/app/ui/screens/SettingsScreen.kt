package agendei.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import agendei.app.ui.theme.*

@Composable
fun SettingsScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(20.dp)
    ) {
        Text("Ajustes", fontSize = 28.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.onBackground)
        Text("Gerencie sua barbearia e conta", color = MutedDark, fontSize = 14.sp)

        Spacer(modifier = Modifier.height(32.dp))

        // Seções de Configuração
        SettingsItem(icon = Icons.Rounded.Store, title = "Perfil da Barbearia", subtitle = "Nome, endereço e horários")
        SettingsItem(icon = Icons.Rounded.Person, title = "Minha Conta", subtitle = "Senha e dados pessoais")
        SettingsItem(icon = Icons.Rounded.ContentCut, title = "Serviços e Preços", subtitle = "Editar catálogo de serviços")
        SettingsItem(icon = Icons.Rounded.Notifications, title = "Notificações", subtitle = "Alertas de agendamentos")
        SettingsItem(icon = Icons.Rounded.ContactSupport, title = "Suporte e Ajuda", subtitle = "Fale com o time Agendei")

        Spacer(modifier = Modifier.weight(1f))

        Button(
            onClick = { /* Logout */ },
            modifier = Modifier.fillMaxWidth().height(56.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Error.copy(alpha = 0.1f)),
            shape = RoundedCornerShape(16.dp)
        ) {
            Text("Sair da Conta", color = Error, fontWeight = FontWeight.Bold)
        }
        Spacer(modifier = Modifier.height(100.dp)) // Espaço para a TabBar flutuante
    }
}

@Composable
fun SettingsItem(icon: ImageVector, title: String, subtitle: String) {
    Card(
        modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(
            modifier = Modifier.padding(16.dp).fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier.size(40.dp).background(Primary.copy(alpha = 0.1f), RoundedCornerShape(10.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = Primary, modifier = Modifier.size(22.dp))
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column {
                Text(title, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface, fontSize = 16.sp)
                Text(subtitle, color = MutedDark, fontSize = 12.sp)
            }
        }
    }
}
