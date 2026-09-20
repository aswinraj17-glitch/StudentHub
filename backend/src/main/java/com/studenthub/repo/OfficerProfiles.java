package com.studenthub.repo;

import com.studenthub.model.Entities.OfficerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OfficerProfiles extends JpaRepository<OfficerProfile, Long> {
    Optional<OfficerProfile> findByUserId(Long id);
}
