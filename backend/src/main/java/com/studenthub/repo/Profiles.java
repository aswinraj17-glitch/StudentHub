package com.studenthub.repo;

import com.studenthub.model.Entities.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface Profiles extends JpaRepository<StudentProfile, Long> {

    Optional<StudentProfile> findByUserId(Long id);

}
