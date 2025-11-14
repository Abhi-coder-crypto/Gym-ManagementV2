# FitPro - Online Gym Management System

## Overview
FitPro is a comprehensive online gym management system designed to serve both administrators and clients. It features distinct dashboards for each user type and supports three subscription tiers: Basic, Premium, and Elite. The system provides clients with a video workout library, diet management tools, access to live training sessions, and progress tracking capabilities. For administrators, FitPro offers robust tools for client management, video library curation, diet and workout plan generation, session scheduling, and analytics. The project aims to provide a scalable and intuitive platform for fitness businesses to manage their operations and engage with their clientele effectively.

## User Preferences
I prefer detailed explanations and a collaborative development process. Please ask for my input before implementing major changes or making significant architectural decisions. I value clear communication and a structured approach to problem-solving.

## System Architecture

### UI/UX Decisions
The system utilizes a fitness-focused Material Design aesthetic, characterized by a blue, orange, and green color scheme. Typography is handled by the Inter and Montserrat font families. The UI is built using `shadcn/ui` and Tailwind CSS, ensuring a modern and responsive design across all dashboards. Dark and light theme toggles are available throughout the application.

### Technical Stack
- **Frontend**: React with TypeScript and Vite for a fast and efficient development experience.
- **Backend**: Express.js with TypeScript for a robust and scalable API.
- **Database**: MongoDB Atlas, accessed via Mongoose for ODM.
- **UI Framework**: `shadcn/ui` combined with Tailwind CSS.
- **Routing**: Wouter for lightweight client-side routing.
- **State Management**: TanStack Query (React Query v5) for efficient data fetching, caching, and state synchronization.

### Feature Specifications
**Client Dashboard**:
- **Personalized Content**: Fetches client-specific information, videos, and sessions from the backend.
- **Progress Tracking**: Includes a weekly workout calendar, visual goal tracking (Weight & Workouts), and achievements system.
- **Body Composition Calculator**: Integrated into the profile, providing BMI, BMR, TDEE, ideal weight range, and goal-based calorie recommendations.
- **Interactive Elements**: Video playback with completion tracking, dynamic category filtering for workouts, and a notification system.

**Admin Dashboard**:
- **Client Management**: Full CRUD operations for clients, with real-time search and detailed client profiles including progress, diet, and session history.
- **Content Management**: Tools for managing video libraries and generating diet/workout plans. Plan generators allow for client-specific calorie targets, goals, diet types, and workout templates, with export functionality.
- **Session Management**: Schedule and oversee live training sessions.
- **Analytics & Revenue**: Visualizations for key metrics like total clients, revenue, growth rate, package distribution, and recent activity.

### System Design Choices
- **Modular Structure**: The project is organized into `client/` and `server/` directories, promoting separation of concerns.
- **API-Driven**: The frontend interacts with a comprehensive set of RESTful API endpoints for all data operations.
- **Automated Seeding**: The MongoDB database is automatically seeded on server startup with demo data, including packages, clients, videos, sessions, and diet/workout plans for easy setup and testing.
- **Controlled Components**: All forms are implemented as controlled components with validation.
- **Responsive Design**: The application is designed to be fully responsive across various screen sizes.

## External Dependencies
- **MongoDB Atlas**: Cloud-hosted NoSQL database for data storage.
- **Mongoose**: Object Data Modeling (ODM) library for MongoDB.
- **Stripe (Planned)**: For payment processing and subscription management.
- **Replit Auth (Planned)**: For user authentication and role-based access control.