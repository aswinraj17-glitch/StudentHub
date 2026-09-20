package com.studenthub.repo;

import com.studenthub.model.Entities.Interview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface Interviews extends JpaRepository<Interview, Long> {

    List<Interview> findByApplicationStudentId(Long id);

}
