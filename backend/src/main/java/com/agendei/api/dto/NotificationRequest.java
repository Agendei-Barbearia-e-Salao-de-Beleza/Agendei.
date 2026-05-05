package com.agendei.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationRequest {
    private String token; // FCM Token do dispositivo
    private String title;
    private String body;
    private String image;
    private Map<String, String> data; // Dados extras (Ex: ID do agendamento)
}
