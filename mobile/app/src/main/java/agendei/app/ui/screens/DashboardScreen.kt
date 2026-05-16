package agendei.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Notifications
import androidx.compose.material.icons.rounded.TrendingUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import agendei.app.ui.theme.*

@Composable
fun DashboardScreen() {
    Column(
        modifier = Modifier.fillMaxSize().background(BackgroundDark).padding(20.dp)
    ) {
        // Header
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Column {
                Text(text = "Agendei. Manager", fontSize = 24.sp, fontWeight = FontWeight.Black, color = TextDark)
                Text(text = "Painel do Gerente", color = MutedDark, fontSize = 14.sp)
            }
            IconButton(onClick = {}) {
                Icon(Icons.Rounded.Notifications, contentDescription = null, tint = Primary)
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Cards de Métricas
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            MetricCard("Hoje", "R$ 450", "+12%", Modifier.weight(1f))
            MetricCard("Mês", "R$ 12.4k", "+5%", Modifier.weight(1f))
        }

        Spacer(modifier = Modifier.height(24.dp))

        Text("Próximos Agendamentos", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TextDark)
        
        Spacer(modifier = Modifier.height(12.dp))

        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            item { AppointmentItem("Matheus Silva", "14:30", "Corte & Barba") }
            item { AppointmentItem("Lucas Souza", "15:15", "Corte Social") }
            item { AppointmentItem("André Costa", "16:00", "Barba Premium") }
            item { AppointmentItem("Roberto Alencar", "17:30", "Corte & Sobrancelha") }
        }
    }
}

@Composable
fun MetricCard(title: String, value: String, growth: String, modifier: Modifier) {
    Card(modifier = modifier, shape = RoundedCornerShape(20.dp), colors = CardDefaults.cardColors(containerColor = CardDark)) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(title, color = MutedDark, fontSize = 12.sp)
            Text(value, fontSize = 20.sp, fontWeight = FontWeight.Black, color = TextDark)
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Rounded.TrendingUp, contentDescription = null, tint = Success, modifier = Modifier.size(14.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text(growth, color = Success, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun AppointmentItem(name: String, time: String, service: String) {
    Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(containerColor = CardDark)) {
        Row(modifier = Modifier.padding(16.dp).fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Column {
                Text(name, fontWeight = FontWeight.Bold, color = TextDark)
                Text(service, color = MutedDark, fontSize = 12.sp)
            }
            Text(time, fontWeight = FontWeight.Black, color = Primary, fontSize = 16.sp)
        }
    }
}
