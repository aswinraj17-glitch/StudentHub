package com.studenthub.config;

import com.studenthub.repo.*;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaRepositories(basePackageClasses = {
        Users.class,
        Jobs.class,
        Apps.class,
        Saved.class,
        Interviews.class,
        Notifications.class,
        Profiles.class,
        OfficerProfiles.class,
        Announcements.class
})
public class RepositoryConfig {
}