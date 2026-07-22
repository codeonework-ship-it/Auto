package com.autohub.shared.application.port;

import java.util.UUID;

/**
 * Access to the authenticated principal for application services, without coupling them to
 * Spring Security or the identity persistence model. Implemented in the identity infrastructure.
 */
public interface CurrentUser {

    /** The authenticated user's id, or throws if the request is unauthenticated. */
    UUID requireUserId();

    /** The authenticated user's email/subject, or throws if unauthenticated. */
    String requireEmail();

    /** Whether the current principal holds the given {@code resource:action} permission. */
    boolean hasPermission(String permissionCode);
}
