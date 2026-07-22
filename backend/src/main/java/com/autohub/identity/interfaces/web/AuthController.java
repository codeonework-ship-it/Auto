package com.autohub.identity.interfaces.web;

import com.autohub.identity.application.AuthService;
import com.autohub.identity.interfaces.web.dto.AuthResponse;
import com.autohub.identity.interfaces.web.dto.ChangePasswordRequest;
import com.autohub.identity.interfaces.web.dto.LoginRequest;
import com.autohub.identity.interfaces.web.dto.LogoutRequest;
import com.autohub.identity.interfaces.web.dto.RefreshRequest;
import com.autohub.identity.interfaces.web.dto.RegisterRequest;
import com.autohub.identity.interfaces.web.dto.UserResponse;
import com.autohub.shared.interfaces.web.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Authentication endpoints (public). Registration creates a MEMBER account, which is the
 * gate for commenting/reviewing across the platform.
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        var tokens = authService.register(
                request.email(), request.username(), request.password(), request.displayName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(AuthResponse.from(tokens)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        var tokens = authService.login(request.email(), request.password());
        return ResponseEntity.ok(ApiResponse.ok(AuthResponse.from(tokens)));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshRequest request) {
        var tokens = authService.refresh(request.refreshToken());
        return ResponseEntity.ok(ApiResponse.ok(AuthResponse.from(tokens)));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody LogoutRequest request) {
        authService.logout(request.refreshToken());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(request.currentPassword(), request.newPassword());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(Authentication authentication) {
        var user = authService.currentUser(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(UserResponse.from(user)));
    }
}
