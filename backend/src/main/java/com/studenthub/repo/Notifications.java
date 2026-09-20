package com.studenthub.repo;

import com.studenthub.model.Entities.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface Notifications extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long id);

}
