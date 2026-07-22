# AutoHub Backend

Spring Boot 3.3 · Java 21 · PostgreSQL · Flyway · Spring Security (JWT) · Spring Kafka.

Built with **Clean Architecture** organised by **bounded context**, plus an **event-driven**
core using the **transactional Outbox** pattern relayed to Kafka.

## Package structure

```
com.autohub
├─ AutoHubApplication
├─ shared/                      cross-cutting kernel
│  ├─ domain/                   DomainEvent, exceptions
│  ├─ application/port/         DomainEventPublisher (port)
│  ├─ infrastructure/
│  │  ├─ event/                 Outbox entity, repo, publisher adapter, relay
│  │  ├─ config/                SecurityConfig, OpenApiConfig
│  │  └─ bootstrap/             BootstrapDataInitializer (seeds SUPER_ADMIN)
│  └─ interfaces/web/           ApiResponse, ApiError, GlobalExceptionHandler
└─ identity/                    reference bounded context (fully wired)
   ├─ domain/                   User aggregate, UserRegisteredEvent, UserRepository port
   ├─ application/              AuthService (use cases), ports, event handler
   ├─ infrastructure/           JPA adapters, JWT, BCrypt, security filter
   └─ interfaces/web/           AuthController, UserAdminController, DTOs
```

Other contexts (`catalog`, `media`, `engagement`, `marketplace`, `travel`, `community`,
`adminops`) follow the same four-layer shape. `catalog.PostController` is included as a
permission-gated scaffold; the remaining feature slices are delivered per the sprint plan.

**Dependency rule:** `interfaces → application → domain`; `infrastructure → application/domain`;
`domain` depends on nothing framework-specific.

## Event flow (Outbox → Kafka)

1. A use case (e.g. `AuthService.register`) mutates state **and** calls
   `DomainEventPublisher.publish(...)` in the same `@Transactional` boundary.
2. `OutboxDomainEventPublisher` serialises the event into the `outbox_events` table — committed
   atomically with the aggregate.
3. `OutboxRelay` (`@Scheduled`) drains `PENDING` rows and publishes them to Kafka
   (topic = event type), marking them `PUBLISHED`. Delivery is at-least-once.
4. Consumers such as `UserRegisteredEventHandler` (`@KafkaListener`) react idempotently.

Set `EVENTS_KAFKA_ENABLED=false` to run without a broker (the relay just marks rows published).

## Run

**With Docker (recommended — from repo root):**
```bash
docker compose up --build backend postgres kafka
```

**Locally against Postgres (requires Maven + a running Postgres):**
```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/AutomobilesDB_Dev
mvn spring-boot:run
```

**Locally with NO dependencies (in-memory H2 — great for a quick run/demo):**
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
# or on a custom port if 8080 is taken:
java -jar target/*.jar --spring.profiles.active=local --server.port=18080
```
The `local` profile uses in-memory H2, disables Flyway/Kafka, and seeds RBAC + starter
masters via `LocalDataSeeder`. Data resets on restart.

- API base: `http://localhost:8080/api/v1`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Health: `http://localhost:8080/actuator/health`

## Default admin (seeded on first start)

| email | password |
|-------|----------|
| `admin@autohub.local` | `Admin@12345` |

Change it immediately in any shared environment.

## Try it

```bash
# Register a member
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"jo@example.com","username":"jo","password":"Passw0rd!"}'

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@autohub.local","password":"Admin@12345"}'

# Use the accessToken:
curl http://localhost:8080/api/v1/users -H "Authorization: Bearer <accessToken>"
```
