# CollabLab

CollabLab is a real-time collaborative circuit design, simulation, and educational grading platform. It shifts from isolated, single-user circuit simulators towards a unified, real-time collaborative platform that brings circuit design, simulation, visualization, automatic reporting, and grading together in one software-based workspace.

## Features Built
- **Dual-Lab Model**: Free Experimental Lab for open exploration, and Task Lab for structured, instructor-assigned coursework.
- **Visual Circuit Canvas**: Drag-and-drop component wiring powered by React Flow.
- **Simulation Engine**: A custom numerical solver in TypeScript computing nodal analysis (MNA) for DC circuits.
- **Real-Time Collaboration**: Multi-user editing, live cursors, and session sync powered by Socket.IO.
- **Custom Component Builder**: Create custom components with parameters evaluated mathematically by the solver.
- **Automatic Reporting**: Live step-by-step PDF report generation reflecting real-time canvas state.
- **Grading & Evaluation**: Instructor assignment grading and feedback workflow.
- **Simulation Telemetry**: Real-time graphing and AC pseudo-transient visualization.

## Known Limitations

Throughout the development of the 12 core modules, certain architectural simplifications and scope reductions were deliberately made to deliver a stable, end-to-end educational platform within a single semester's timeframe. These limitations are documented below for future reference:

1. **Non-Linear Components (Diode & Transistor)**
   - The iterative piecewise linear model for diodes and transistors (Newton-Raphson method) was explicitly deferred to avoid immense mathematical complexity in the MNA solver.
   - *Current Behavior*: Diodes are simulated unconditionally as open circuits (1 G-ohm). Transistors are completely ignored by the solver (no-op).

2. **Capacitor and Inductor Static-DC Treatment in AC Graphs**
   - True transient simulation (solving differential equations over time) was deferred. The engine uses a pseudo-transient approach by stepping through time and running the DC solver at each instantaneous voltage of the AC sources.
   - *Current Behavior*: Capacitors remain strictly DC-open and Inductors remain DC-short at every time step. Charging curves, phase shifts, and filtering effects do not occur. AC waves simply pass through inductors unchanged and are blocked by capacitors.

3. **Database Infrastructure (PostgreSQL on Neon)**
   - Migrated to PostgreSQL with Prisma ORM for production deployment on Neon.
   - *Current Behavior*: Models use PostgreSQL data types with UUID string identifiers. Role, SubmissionStatus, and CollaboratorRole fields use string representations validated at the application/middleware level to maintain cross-environment flexibility.

4. **Report Storage & Ephemeral Filesystem Persistence**
   - Cloud hosts like Render employ ephemeral container filesystems that discard local files upon restart or redeployment.
   - *Current Behavior*: Generated PDF simulation reports are stored as Base64 binaries in the `Report.content` database field upon generation, while local disk serves as an optional read/write cache. The download handler queries the database if the disk cache is absent, ensuring persistent report access across container restarts.

5. **Collaboration Conflict Resolution**
   - Given the scope, granular Operational Transformation (OT) or CRDTs for real-time collaboration were deferred.
   - *Current Behavior*: The system uses a **Last-Write-Wins** strategy per component/property. Granular events (e.g., "move component X", "change resistance") rely on standard WebSocket event ordering with the Node.js backend acting as the single source of truth.

6. **Polling-Based Grade Delivery**
   - Real-time Socket.IO pushes were utilized extensively for collaboration and telemetry, but grade delivery to students was simplified.
   - *Current Behavior*: Students receive updated grades via polling or by manually refreshing/visiting the Dashboard, rather than receiving a real-time push notification when the teacher submits the grade.
