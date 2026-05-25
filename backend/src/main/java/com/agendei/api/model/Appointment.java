package com.agendei.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "agendamentos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private User cliente;

    @Column(name = "preco_total", nullable = false)
    private Double totalPrice;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime appointmentDate;

    @Enumerated(EnumType.STRING)
    private Status status;

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    private LocalDateTime createdAt;

    public enum Status {
        SOLICITADO,
        APROVADO,
        CANCELADO,
        CONCLUIDO,
        ATRASADO
    }
}
