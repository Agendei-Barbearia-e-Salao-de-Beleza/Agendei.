package com.agendei.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "servicos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    private String nome;

    private String descricao;

    @Column(nullable = false, name = "preco")
    private Double price;

    @Column(name = "duracao_minutos")
    private Integer durationMinutes;

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    private LocalDateTime createdAt;
}
