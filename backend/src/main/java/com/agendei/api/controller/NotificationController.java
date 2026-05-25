package com.agendei.api.controller;

import com.agendei.api.dto.NotificationRequest;
import com.agendei.api.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/send")
    public ResponseEntity<String> sendNotification(@RequestBody NotificationRequest request) {
        boolean success = notificationService.sendPushNotification(request);
        if (success) {
            return ResponseEntity.ok("Notificação enviada com sucesso!");
        } else {
            return ResponseEntity.internalServerError().body("Falha ao enviar notificação. Verifique se o Firebase está configurado corretamente.");
        }
    }
}
