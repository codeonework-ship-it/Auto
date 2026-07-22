package com.autohub.identity.application.port;

import com.autohub.identity.domain.model.User;

/** Outbound port for issuing authentication tokens (adapter: JWT). */
public interface TokenService {

    TokenPair issueTokens(User user);

    record TokenPair(String accessToken, String refreshToken, long expiresInSeconds) {}
}
