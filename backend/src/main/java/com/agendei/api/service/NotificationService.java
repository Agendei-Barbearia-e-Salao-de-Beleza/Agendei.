package com.agendei.api.service;

import com.agendei.api.dto.NotificationRequest;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;


@Slf4j
@Service
public class NotificationService {

    /**
     * Envia uma notificação Push para um dispositivo específico via FCM
     * @param request Dados da notificação
     * @return true se enviado com sucesso, false caso contrário
     */
    public boolean sendPushNotification(NotificationRequest request) {
        try {
            Notification notification = Notification.builder()
                    .setTitle(request.getTitle())
                    .setBody(request.getBody())
                    .setImage(request.getImage())
                    .build();

            Message message = Message.builder()
                    .setToken(request.getToken())
                    .setNotification(notification)
                    .putAllData(request.getData() != null ? request.getData() : Map.of())
                    .build();

            String response = FirebaseMessaging.getInstance().send(message);
            log.info("🔔 Notificação enviada com sucesso! ID: {}", response);
            return true;
        } catch (Exception e) {
            log.error("❌ Falha ao enviar notificação push: {}", e.getMessage());
            return false;
        }
    }
}
