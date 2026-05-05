package com.agendei.api.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;

@Slf4j
@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initialize() {
        try {
            // Tenta carregar do classpath (src/main/resources)
            ClassPathResource resource = new ClassPathResource("service-account.json");
            
            if (resource.exists()) {
                InputStream serviceAccount = resource.getInputStream();

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();

                if (FirebaseApp.getApps().isEmpty()) {
                    FirebaseApp.initializeApp(options);
                    log.info("🔥 Firebase inicializado com sucesso via service-account.json");
                }
            } else {
                log.warn("⚠️ Arquivo service-account.json não encontrado em resources. O Firebase não será inicializado.");
                log.warn("💡 Para corrigir, baixe a chave no Console do Firebase e salve em: backend/src/main/resources/service-account.json");
            }
        } catch (IOException e) {
            log.error("❌ Erro ao inicializar Firebase: {}", e.getMessage());
        }
    }
}
