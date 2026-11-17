# Design Decisions

## 1. Technology Stack
- **Frontend**: React + TypeScript (via Vite). Selected for component-based architecture and strong typing.
- **Canvas**: React Flow. Ideal for node-based editors, fitting the circuit builder perfectly.
- **Styling**: Tailwind CSS (v3.4.1). Decided to downgrade/pin to Tailwind v3 because v4's new architecture broke the PostCSS configuration and `tailwind.config.js` approach established in the initial skeleton. Using v3 guarantees stability and predictable configuration for the rest of the project.
- **Backend**: Node.js with Express and TypeScript. Aligns with full-stack JS/TS, making type sharing easier between frontend and backend.
- **Real-time**: Socket.IO. Provides robust WebSockets with built-in rooms and fallback mechanisms.
- **Database**: SQLite is used for local development (converted from PostgreSQL requirement in spec) to avoid external container dependencies. Prisma serves as the ORM.
- **Simulation**: Custom numerical solver in TypeScript on the backend. This fulfills the requirement for a real nodal-analysis solver without needing an external Python service, keeping the stack unified.

## 2. Real-time Conflict Resolution & Persistence
- **Strategy**: Last-write-wins per component/property. Given the scope, a granular operational transform is overly complex. By emitting granular events (e.g., "move component X", "change resistance of Y"), we can rely on standard WebSocket event ordering, leaning on the backend as the single source of truth.
- **Persistence (Module 6)**: To avoid excessive database writes on every node/edge drag, the session's `circuitGraph` is kept in-memory (`circuitState`) on the Node.js server. The state is updated whenever a client broadcasts a `circuit-full-sync` event. A unified save to the database is triggered on a 60-second autosave interval and whenever the final active user disconnects from the session.

## 3. Data Model
- We use a relational approach where a `CircuitSession` holds the current JSON state of the circuit graph, while an `ActionHistoryEntry` log tracks the chronological actions for report generation.
- Role-based authorization is enforced via middleware in Express, verifying standard JWT tokens.
- **Collaboration & Permissions**: Added a `SessionCollaborator` join model to explicitly track which users have access to a session and what their permissions are (EDITOR vs VIEWER). The session owner can manage these roles.
- **Grading Workflow States**: Added a `SubmissionStatus` enum (`IN_PROGRESS`, `SUBMITTED`, `GRADED`) to `CircuitSession` so that the backend can properly track the lifecycle of a Task Lab experiment submission.

### Module 3 Component Decisions
- **Battery vs DC Source**: Created a distinct BatteryNode (long/short parallel lines symbol) separate from the generic VoltageSourceNode (circle symbol) to strictly adhere to Section 2 item 2 of the specification.
- **Wire/Connector**: Regular wires are handled natively by React Flow's SmoothStep edges. To satisfy the 'connector' requirement for joining more than two wires at a single point, a JunctionNode was created.

### Database Infrastructure
- **SQLite vs PostgreSQL**: SQLite used for local development due to no Docker/Postgres access, production would use PostgreSQL per Section 8. Prisma schema provider was changed and enums were converted to String types to support SQLite.

### Schema Simplification (Prisma & SQLite)
- **Enum to String Conversion**: Because SQLite does not support native database-level enums in Prisma, the Role, SubmissionStatus, and CollaboratorRole fields were converted to generic String types. To mitigate the risk of invalid data entry, strict application-level validation (TypeScript literal types/enums and runtime controller checks) is enforced before any database writes.
  - *Reminder*: Ensure explicit validation (throwing 400 error rather than silent fallback) is added for `SubmissionStatus` and `CollaboratorRole` before beginning Module 6 (Collaboration) and Modules 9/10 (Task Lab/Grading).

### Simulation Engine (Module 5)
- **Non-Linear Components (Diode, LED, & Transistor)**: The iterative piecewise linear model for diodes, LEDs, and transistors has been explicitly deferred. Currently, diodes and LEDs are simulated as unconditional open circuits (1 G-ohm), and transistors are completely ignored by the solver (no-op). This avoids the immediate complexity of a Newton-Raphson iterative MNA loop in the first pass. This behavior is documented and pinned with tests until a robust non-linear solver is implemented.

### Simulation Persistence (Module 5 -> 9/10)
- **FreeLab vs Task Lab**: The backend /api/simulation/simulate endpoint is capable of persisting results to the database if a sessionId is provided. However, for the current FreeLab implementation (Module 5 frontend wiring), simulation results are explicitly not persisted (ephemeral) because FreeLab has no session context. Passing sessionId and persisting results is deferred until Module 9/10 (Task Lab/Grading).

### Simulation Telemetry & Advanced Visualization (Module 7)
- **Pseudo-Transient AC Simulation**: True transient simulation (solving differential equations for capacitors/inductors over time) was deferred to avoid immense complexity at this stage. Instead, the backend uses a pseudo-transient approach: it steps through time and computes the instantaneous voltage of AC sources, re-running the DC nodal analysis solver at each step to build time-series data for waveform graphing.
- **Capacitor and Inductor AC Behavior Deferred**: Because capacitors and inductors remain strictly DC-open and DC-short (respectively) at every instantaneous time step, an AC circuit containing them will not show charging curves, phase shifts, or filtering effects. The AC wave will simply pass through a DC-short inductor unchanged or be entirely blocked by a DC-open capacitor. This limitation is explicitly surfaced in the UI to prevent student confusion.

### Production Deployment & Report Persistence
- **PostgreSQL Migration (Neon Database)**: Migrated Prisma ORM from SQLite to PostgreSQL. Schema field types and UUID identifiers map directly to PostgreSQL primitives. Application-level validation maintains data integrity across roles and session statuses.
- **Database-Backed Report Storage**: Ephemeral cloud containers (Render) wipe local filesystem state upon restart. Generated PDF reports are stored in Base64 encoding in the `Report.content` database column upon generation, with local disk serving as an optional write-through cache. Download endpoints query the database if the disk cache is absent, guaranteeing zero report loss across container rebuilds and server restarts.
