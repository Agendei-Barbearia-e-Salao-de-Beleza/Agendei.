package com.agendei.api.repository;

import com.agendei.api.model.Appointment;
import com.agendei.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    List<Appointment> findByCustomer(User customer);
    List<Appointment> findByBarber(User barber);
    List<Appointment> findByAppointmentDateBetween(LocalDateTime start, LocalDateTime end);
}
