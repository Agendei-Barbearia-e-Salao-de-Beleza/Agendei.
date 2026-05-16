package agendei.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import agendei.app.ui.theme.*

data class Appointment(
    val id: String,
    val clientName: String,
    val serviceName: String,
    val time: String,
    val price: String,
    val status: String // "Confirmado", "Pendente", "Finalizado"
)

@Composable
fun AgendaScreen() {
    val appointments = listOf(
        Appointment("1", "Matheus Santos", "Corte + Barba", "14:00", "R$ 85,00", "Confirmado"),
        Appointment("2", "Ana Oliveira", "Progressiva", "15:30", "R$ 180,00", "Pendente"),
        Appointment("3", "Lucas Silva", "Corte Degradê", "17:00", "R$ 45,00", "Confirmado")
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(20.dp)
    ) {
        Text(
            text = "Agenda de Hoje",
            color = MaterialTheme.colorScheme.onBackground,
            fontSize = 28.sp,
            fontWeight = FontWeight.Black,
            letterSpacing = (-1).sp
        )
        
        Text(
            text = "Sexta-feira, 15 de Maio",
            color = MutedDark,
            fontSize = 14.sp,
            modifier = Modifier.padding(bottom = 24.dp)
        )

        LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(appointments) { appointment ->
                AppointmentItem(appointment)
            }
        }
    }
}

@Composable
fun AppointmentItem(appointment: Appointment) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Row(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Time Column
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(text = appointment.time, fontWeight = FontWeight.Bold, color = Primary, fontSize = 16.sp)
                Box(modifier = Modifier.size(4.dp).background(Primary, RoundedCornerShape(2.dp)))
            }
            
            Spacer(modifier = Modifier.width(20.dp))
            
            // Client & Service Info
            Column(modifier = Modifier.weight(1f)) {
                Text(text = appointment.clientName, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface, fontSize = 16.sp)
                Text(text = appointment.serviceName, color = MutedDark, fontSize = 12.sp)
            }

            // Status Badge
            Surface(
                color = if(appointment.status == "Confirmado") Success.copy(alpha = 0.1f) else Color.White.copy(alpha = 0.05f),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(
                    text = appointment.status,
                    color = if(appointment.status == "Confirmado") Success else MutedDark,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
