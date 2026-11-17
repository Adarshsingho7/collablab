# CollabLab - Real-Time Collaborative Virtual Electronics Laboratory

## Overview
CollabLab is a browser-based, real-time collaborative electronics laboratory simulator. It allows multiple users (students) to build, wire, and simulate virtual electronic circuits on a shared canvas.

## High-Level Architecture

### Client-Server Architecture
The system is divided into clear layers:
- **Frontend Application**: React + TypeScript, using React Flow for the circuit canvas and Zustand for client-side state.
- **Backend API Server**: Node.js + Express, providing REST endpoints for CRUD operations and authentication.
- **Real-Time Collaboration Layer**: Socket.IO for WebSockets, handling live multi-user editing events (cursor tracking, component moving, wiring).
- **Simulation Engine**: Isolated TypeScript/JavaScript module on the backend implementing nodal analysis for circuit solving.
- **Report Generation Service**: Server-side service to generate PDF reports (using a library like PDFMake/Puppeteer) from session history and simulation results.
- **Database**: PostgreSQL (via Prisma ORM) for relational storage.

### Modules
1. **Workspace and Lab Selection**: Differentiates between Free Experimental Lab and Task Lab.
2. **Circuit Canvas**: The core interactive visual editor.
3. **Standard Component Library**: Predefined electronic components.
4. **Custom Component Builder**: UI and logic for user-defined components.
5. **Simulation Engine**: Solves DC circuits using nodal analysis.
6. **Real-Time Collaboration**: Synchronizes state between active clients.
7. **Data Visualization**: Recharts for rendering simulation graphs.
8. **Automatic Report Generation**: Tracks chronological actions and outputs PDFs.
9. **Task Lab and Experiment Assignment**: Teacher-created experiments.
10. **Grading and Evaluation**: Teacher UI for reviewing and grading submissions.
11. **User Roles and Access Management**: JWT-based auth and Role-Based Access Control (Student vs Teacher).
12. **Session and History Management**: Persistence for past and current sessions.

### Design Principles
- **Separation of concerns**: UI, business logic, simulation, and reporting are loosely coupled.
- **Real-time-first**: Edit events are granular to support efficient broadcasting.
- **Single Source of Truth**: The server state dictates the final simulation results and session state.
- **Software Simulation Only**: No hardware interfacing or robotics.
