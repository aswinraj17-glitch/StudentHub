package com.studenthub.repo;

import com.studenthub.model.Entities.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface Announcements extends JpaRepository<Announcement, Long> {
    List<Announcement> findAllByOrderByCreatedAtDesc();
}
