package com.autohub.identity.application.port;

/** Outbound port for password hashing/verification (adapter: BCrypt). */
public interface PasswordHasher {

    String hash(String rawPassword);

    boolean matches(String rawPassword, String passwordHash);
}
