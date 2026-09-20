package com.studenthub.repo;

import com.studenthub.model.Entities.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface Apps extends JpaRepository<Application, Long> {

    List<Application> findByStudentId(Long id);

    List<Application> findByJobId(Long id);

    boolean existsByStudentIdAndJobId(Long studentId, Long jobId);

}
