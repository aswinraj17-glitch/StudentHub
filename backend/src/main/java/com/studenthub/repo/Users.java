package com.studenthub.repo;

import com.studenthub.model.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface Users extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

}
