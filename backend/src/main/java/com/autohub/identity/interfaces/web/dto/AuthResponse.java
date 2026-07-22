package com.autohub.identity.interfaces.web.dto;

import com.autohub.identity.application.port.TokenService;

public record AuthResponse(String accessToken, String refreshToken, String tokenType, long expiresIn) {

    public static AuthResponse from(TokenService.TokenPair pair) {
        return new AuthResponse(pair.accessToken(), pair.refreshToken(), "Bearer", pair.expiresInSeconds());
    }
}
