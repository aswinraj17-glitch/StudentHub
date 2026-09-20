package com.studenthub.repo;

import com.studenthub.model.Entities.SavedJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface Saved extends JpaRepository<SavedJob, Long> {

    List<SavedJob> findByStudentId(Long id);

}
