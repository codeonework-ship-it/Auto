package com.autohub.shared.infrastructure.bootstrap;

import com.autohub.identity.infrastructure.persistence.RoleEntity;
import com.autohub.identity.infrastructure.persistence.RoleJpaRepository;
import com.autohub.identity.infrastructure.persistence.UserEntity;
import com.autohub.identity.infrastructure.persistence.UserJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.ApplicationArguments;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Idempotently seeds the initial SUPER_ADMIN account on startup. The password is hashed here
 * (rather than in a SQL migration) so it always matches the application's PasswordEncoder.
 *
 * <p>Default credentials (change immediately in any shared environment):
 * <pre>  email: admin@autohub.local   password: Admin@12345 </pre>
 */
@Component
@Order(20)   // runs after LocalDataSeeder (Order 10) so the SUPER_ADMIN role exists on the `local` profile
public class BootstrapDataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(BootstrapDataInitializer.class);

    private static final String ADMIN_EMAIL = "admin@autohub.local";
    private static final String ADMIN_USERNAME = "superadmin";
    private static final String ADMIN_PASSWORD = "Admin@12345";

    private final UserJpaRepository userJpa;
    private final RoleJpaRepository roleJpa;
    private final PasswordEncoder passwordEncoder;

    public BootstrapDataInitializer(UserJpaRepository userJpa, RoleJpaRepository roleJpa,
                                    PasswordEncoder passwordEncoder) {
        this.userJpa = userJpa;
        this.roleJpa = roleJpa;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userJpa.existsByEmail(ADMIN_EMAIL)) {
            return;
        }
        RoleEntity superAdmin = roleJpa.findByCode("SUPER_ADMIN").orElse(null);
        if (superAdmin == null) {
            log.warn("SUPER_ADMIN role missing; skipping admin seed (check Flyway V2 migration)");
            return;
        }
        UserEntity admin = new UserEntity(
                UUID.randomUUID(), ADMIN_EMAIL, ADMIN_USERNAME,
                passwordEncoder.encode(ADMIN_PASSWORD), "Super Admin");
        admin.addRole(superAdmin);
        userJpa.save(admin);
        log.info("Seeded SUPER_ADMIN user '{}' (default password — change it!)", ADMIN_EMAIL);
    }
}
