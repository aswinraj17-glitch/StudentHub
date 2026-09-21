package com.studenthub.repo;

import com.studenthub.model.Entities.CandidateRoundResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CandidateRoundResults extends JpaRepository<CandidateRoundResult, Long> {

    List<CandidateRoundResult> findByApplicationId(Long applicationId);

    List<CandidateRoundResult> findByJobRoundId(Long jobRoundId);

    Optional<CandidateRoundResult> findByApplicationIdAndJobRoundId(Long applicationId, Long jobRoundId);

    void deleteByApplicationId(Long applicationId);
}
