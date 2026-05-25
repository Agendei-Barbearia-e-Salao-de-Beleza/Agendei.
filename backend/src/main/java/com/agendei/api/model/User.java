package com.agendei.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "usuarios")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    private String nome;

    @Email
    @NotBlank
    @Column(unique = true)
    private String email;

    @Column(name = "senha_hash")
    private String password;

    private String telefone;

    @Enumerated(EnumType.STRING)
    @Column(name = "perfil")
    private Role role;

    @Column(name = "firebase_token")
    private String firebaseToken;

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    private LocalDateTime createdAt;

    public enum Role {
        ADMIN,
        CLIENTE,
        BARBEIRO
    }
}
