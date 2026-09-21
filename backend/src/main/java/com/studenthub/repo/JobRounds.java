package com.studenthub.repo;

import com.studenthub.model.Entities.JobRound;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobRounds extends JpaRepository<JobRound, Long> {

    List<JobRound> findByJobIdOrderByRoundOrderAsc(Long jobId);

    void deleteByJobId(Long jobId);
}
