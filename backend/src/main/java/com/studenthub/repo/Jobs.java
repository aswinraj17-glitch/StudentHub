package com.studenthub.repo;

import com.studenthub.model.Entities.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface Jobs extends JpaRepository<Job, Long> {

    List<Job> findByRecruiterId(Long id);

    @Query("SELECT j FROM Job j WHERE j.active = true AND j.approved = true " +
           "AND (:q = '' OR LOWER(j.title) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(j.skills) LIKE LOWER(CONCAT('%', :q, '%'))) " +
           "AND (:l = '' OR LOWER(j.location) LIKE LOWER(CONCAT('%', :l, '%')))")
    List<Job> search(@Param("q") String q, @Param("l") String l);

}
