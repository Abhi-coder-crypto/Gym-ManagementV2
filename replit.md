# FitPro - Online Gym Management System

## Overview
FitPro is a comprehensive online gym management system for administrators and clients, offering distinct dashboards and supporting Basic, Premium, and Elite subscription tiers. Clients access a video workout library, diet management, live training, and progress tracking. Administrators utilize tools for client management, video library curation, diet/workout plan generation, session scheduling, and analytics. The project aims to provide a scalable and intuitive platform for fitness businesses to manage operations and engage clientele.

## User Preferences
I prefer detailed explanations and a collaborative development process. Please ask for my input before implementing major changes or making significant architectural decisions. I value clear communication and a structured approach to problem-solving.

## System Architecture

### UI/UX Decisions
The system uses a fitness-focused Material Design with a blue, orange, and green color scheme. Inter and Montserrat fonts are used for typography. The UI is built with `shadcn/ui` and Tailwind CSS for responsiveness, featuring dark and light theme toggles.

### Technical Implementations
- **Frontend**: React with TypeScript and Vite.
- **Backend**: Express.js with TypeScript.
- **Database**: MongoDB Atlas via Mongoose.
- **UI Framework**: `shadcn/ui` and Tailwind CSS.
- **Routing**: Wouter.
- **State Management**: TanStack Query (React Query v5).

### Feature Specifications
**Client Dashboard**:
- Personalized content (videos, sessions).
- Progress tracking: weekly workout calendar, visual goal tracking (Weight & Workouts), achievements.
- Body Composition Calculator: BMI, BMR, TDEE, ideal weight, calorie recommendations.
- Interactive elements: video playback, category filtering, notifications.
- Goal Setting & Management: CRUD for weight, fitness, nutrition goals with milestone tracking and visual progress.
- Progress Tracking System: Weight tracking, body measurements, progress charts, achievements, personal records, weekly completion, monthly reports.

**Admin Dashboard**:
- Client Management: CRUD operations, search, detailed profiles.
- Content Management: Video library tools, diet/workout plan generation with export.
- Session Management: Schedule and oversee live training.
- Analytics & Revenue: Visualizations for clients, revenue, growth, package distribution, activity.
- Revenue & Payment Management: Payment tracking, invoicing, refunds, revenue analytics with various financial reports and export functionality.
- Video & Workout Library Management: CRUD for videos with advanced filtering, analytics (views, completions), draft management, equipment tracking, trainer assignment, and difficulty/intensity levels.
- Document Viewer: Reusable component for viewing client documents (ID proofs, medical certificates) directly within the application using a modal.

### System Design Choices
- **Modular Structure**: `client/` and `server/` directories.
- **API-Driven**: RESTful API endpoints for all data operations.
- **Automated Seeding**: MongoDB seeded with demo data on server startup.
- **Controlled Components**: Forms with validation.
- **Responsive Design**: Fully responsive across devices.

## Recent Changes
### November 21, 2025 - Session Assignment Fixes
Fixed three critical issues in the live session assignment system:
1. **Trainer Assignment Persistence**: Updated AssignSessionDialog to use `useEffect` to load and display currently assigned trainer when dialog reopens
2. **Client Assignment 500 Error**: Simplified package validation logic in `/api/sessions/:id/assign` endpoint to prevent ObjectId casting errors
3. **Trainer Dashboard Data**: Updated `assignSessionToClients` method to properly sync `LiveSession.clients` array with `SessionClient` records, ensuring trainer dashboards display assigned sessions correctly

### Implementation Details
- **Dialog State Management**: Added `currentAssignments` query and `useEffect` hook to pre-populate trainer selection based on existing session assignments
- **Validation Simplification**: Removed complex package name matching logic that was causing errors; now validates only client existence and duplicate assignments
- **Data Synchronization**: `assignSessionToClients` now updates both `SessionClient` records AND `LiveSession.clients` array to maintain consistency across the system

## External Dependencies
- **MongoDB Atlas**: Cloud-hosted NoSQL database.
- **Mongoose**: ODM for MongoDB.
- **Stripe (Planned)**: For payment processing.
- **Replit Auth (Planned)**: For authentication.