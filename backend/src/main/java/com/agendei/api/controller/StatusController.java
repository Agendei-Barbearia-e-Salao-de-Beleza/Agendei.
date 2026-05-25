package com.agendei.api.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class StatusController {

    @GetMapping("/status")
    public Map<String, String> getStatus() {
        return Map.of(
            "status", "UP",
            "message", "Agendei API is running perfectly!",
            "version", "1.0.0"
        );
    }
}
