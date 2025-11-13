# FitPro - Online Gym Management System

## Project Overview
Comprehensive online gym management system with separate admin and client dashboards, featuring three subscription tiers (Basic, Premium, Elite), video workout libraries, diet management, live training sessions, and progress tracking.

## Current State
- **Design System**: Fitness-focused Material Design with blue/orange/green color scheme, Inter/Montserrat fonts
- **Authentication**: Phone-based client login + admin password login (Admin@123)
- **Payment**: Ready for Stripe integration
- **Database**: MongoDB with automated seeding (demo client: 8600126395 / Abhijeet Singh)
- **Phase**: Functional prototype with body composition tools and plan generators

## Architecture

### Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: shadcn/ui + Tailwind CSS
- **Routing**: Wouter

### Directory Structure
```
client/
  src/
    components/        - Reusable UI components
    pages/            - Route pages
      landing.tsx     - Public landing with Client/Admin buttons
      admin-*.tsx     - Admin dashboard pages
      client-*.tsx    - Client dashboard pages
    lib/              - Utilities and configurations
server/
  routes.ts           - API endpoints (stubbed)
  storage.ts          - Data layer interface
shared/
  schema.ts           - Shared types and validation
```

## Features Implemented

### Landing Page
- Hero section with gym background
- Single "Access Client Dashboard" button (admin access via /admin URL only)
- Dark/light theme toggle

### Admin Dashboard (`/admin/*`)

#### Admin Login (`/admin`)
- Password-protected access (Admin@123)
- Improved centered card design with shield icon
- Back to home navigation
- Dark/light theme toggle

#### 1. Dashboard (`/admin`)
- 4 key metrics: Total Clients, Active Users, Revenue, Growth Rate
- Recent clients list with package badges
- Quick action buttons
- Collapsible sidebar navigation

#### 2. Clients Management (`/admin/clients`)
- Complete client list (8 sample clients)
- Real-time search by name/email
- Client detail modal with 4 tabs:
  - **Info**: Contact details, action buttons
  - **Progress**: Workout stats, weekly progress charts
  - **Diet**: Assigned diet plan
  - **Sessions**: Live session attendance history
- Add Client modal with full form

#### 3. Video Library (`/admin/videos`)
- 9 workout videos with thumbnails
- Search functionality
- Upload video modal with category/difficulty selection
- Video management interface

#### 4. Diet Plans (`/admin/diet`)
- **3 Tabs**: Plan Generators, Diet Plans, Workout Plans
- **Diet Plan Generator**:
  - Client name input
  - Calorie target selection (1500-3500)
  - Goal-based planning (lose/maintain/gain)
  - Diet type selection (balanced, high protein, low carb, keto, vegan)
  - Complete meal plans with macro breakdowns
  - Export to text file with validation
- **Workout Plan Generator**:
  - Client name input
  - Duration selection (7/14/21/30 days)
  - 5 templates (beginner, intermediate, advanced, strength, cardio)
  - Daily exercise schedules with sets/reps
  - Export to text file with validation
- 5 diet plans (Low Carb, High Protein, Keto, Vegan, Balanced)
- Full details: calories, meals per day, assigned clients
- Edit and assign functionality

#### 5. Live Sessions (`/admin/sessions`)
- Session management (upcoming, live, completed)
- Trainer info, participants, capacity tracking
- Schedule new session button

#### 6. Analytics (`/admin/analytics`)
- Package distribution chart with percentages
- Monthly client growth visualization
- Recent activity feed
- 4 key performance metrics

#### 7. Revenue & Payments (`/admin/revenue`)
- Monthly revenue trending
- Revenue by package breakdown
- Recent payments list
- Export report functionality

### Client Dashboard (`/client/*`)

#### 1. Dashboard (`/client`)
- Welcome message with package badge
- 4 personal stats: Streak, Sessions Completed, Calories, Next Session
- **Continue Watching** section (3 videos)
- **Upcoming Live Sessions** (2 cards)
- **Progress Tracker Widget**:
  - Weekly workout calendar
  - Visual goal tracking (Weight & Workouts)
  - Update goals button
- **Achievements Widget**:
  - 6 unlockable achievements
  - Progress indicator (3/6 unlocked)
  - Visual badge system
- Video player modal with completion tracking

#### 2. Workouts (`/client/workouts`)
- Full video library (9 videos)
- **Working category filter** (All, Strength, Cardio, Yoga, HIIT)
- Dynamic count updates
- Video player modal with "Mark as Complete" feature

#### 3. Diet Plan (`/client/diet`)
- Nutrition goals dashboard (Calories, Protein, Carbs, Fats)
- 3-day detailed meal plans:
  - 4 meals per day with times
  - Complete macro breakdown
  - Total calories per day

#### 4. Live Sessions (`/client/sessions`)
- 3 sections: Live Now, Upcoming, Completed
- Full session details (trainer, time, participants)
- Join/Reserve buttons

#### 5. Workout History (`/client/history`)
- Total stats: Workouts, Calories, Duration
- Weekly progress charts with trending
- Recent workouts list with completion badges

#### 6. Profile & Settings (`/client/profile`)
- 4 tabs: Personal Info, Subscription, Preferences, Body Composition
- **Personal Info**: Contact details form
- **Subscription**: Current plan, billing date, payment method
- **Preferences**: Notification settings, fitness goals
- **Body Composition Calculator**:
  - Height, weight, age, gender, activity level inputs
  - BMI calculation with category display
  - BMR (Basal Metabolic Rate) calculation
  - TDEE (Total Daily Energy Expenditure) calculation
  - Ideal weight range recommendation
  - Goal-based calorie recommendations (lose/maintain/gain)

### Interactive Features

#### Notification System
- Notification center with badge count
- 4 notification types: Sessions, Achievements, Videos, Diet
- Mark as read functionality
- Unread count indicator

#### Modals & Dialogs
- Video player with completion tracking
- Client detail with 4-tab interface
- Add client form
- Upload video form
- All forms functional with console logging

#### Data Visualization
- Progress bars for goals and metrics
- Monthly trend charts
- Package distribution charts
- Weekly activity calendars

## Interactive Elements (All Working)

### Client Side
- ✅ Phone-based login (demo: 8600126395)
- ✅ Video playback modal
- ✅ Mark workout as complete
- ✅ Category filtering with live updates
- ✅ Search functionality
- ✅ Progress tracking visualization
- ✅ Achievements display
- ✅ Notification center
- ✅ Profile settings forms
- ✅ Body composition calculator (BMI, BMR, TDEE, ideal weight)
- ✅ Theme toggle (light/dark)
- ✅ Navigation between pages

### Admin Side
- ✅ Password-protected login (Admin@123)
- ✅ Client search (real-time filtering)
- ✅ Client detail modal (4 tabs)
- ✅ Add client form
- ✅ Upload video form
- ✅ Revenue charts
- ✅ Analytics visualizations
- ✅ Package management
- ✅ Session scheduling interface
- ✅ Workout plan generator with templates
- ✅ Diet plan generator with calorie targets
- ✅ Export plans to text files with validation
- ✅ Theme toggle (light/dark)
- ✅ Sidebar navigation

## Routes

### Public
- `/` - Landing page
- `/client-access` - Client phone login
- `/admin` - Admin password login

### Client
- `/client` - Dashboard
- `/client/workouts` - Video library
- `/client/diet` - Diet plan
- `/client/sessions` - Live sessions
- `/client/history` - Workout history
- `/client/profile` - Settings & profile (with body composition calculator)

### Admin
- `/admin/dashboard` - Dashboard overview
- `/admin/clients` - Client management
- `/admin/videos` - Video library
- `/admin/diet` - Diet plans & generators (workout/diet plan generators)
- `/admin/sessions` - Live sessions
- `/admin/analytics` - Analytics & reports
- `/admin/revenue` - Revenue & payments

## Components

### Shared
- `stat-card` - Metric display cards
- `video-card` - Video thumbnails with play
- `live-session-card` - Session info cards
- `diet-plan-card` - Meal plan display
- `theme-toggle` - Dark/light mode switch

### Client-Specific
- `progress-tracker` - Goals and calendar
- `achievements-widget` - Badge system
- `notification-center` - Alerts dropdown
- `video-player-modal` - Video playback
- `body-composition-calculator` - BMI, BMR, TDEE calculator

### Admin-Specific
- `admin-sidebar` - Navigation sidebar
- `client-detail-modal` - Client details (4 tabs)
- `add-client-modal` - New client form
- `upload-video-modal` - Video upload form
- `workout-plan-generator` - Template-based workout plans
- `diet-plan-generator` - Calorie-based diet plans

## Data Structure (Dummy Data)

### Clients
- Demo client: Abhijeet Singh (phone: 8600126395) - Premium package
- 8 sample clients across 3 packages
- Contact info, package, status, join date
- Progress tracking, workout history
- Diet assignments, session attendance

### Videos
- 9 workout videos across 4 categories
- Thumbnails, duration, category
- View counts, completion tracking

### Diet Plans
- 5 different plans (Basic to Elite)
- Daily calories, meal counts
- Macro breakdowns, assigned clients

### Live Sessions
- 6 sessions (upcoming, live, completed)
- Trainer info, timing, participants
- Capacity tracking

## Next Steps for Production

### Authentication
1. Integrate Replit Auth
2. Set up role-based access (admin/client)
3. Add protected routes

### Payments
1. Integrate Stripe
2. Set up subscription management
3. Implement payment tracking

### Backend
1. Implement actual API endpoints
2. Connect to PostgreSQL database
3. Add real-time features for live sessions

### Testing
1. E2E tests with Playwright
2. Unit tests for components
3. API endpoint testing

## Development Notes

- **Admin Access**: Only via `/admin` route with password "Admin@123"
- **Demo Client**: Phone 8600126395, Name "Abhijeet Singh" (auto-seeded on startup)
- **Export Validation**: Both workout and diet generators validate before export
- All interactive elements log to console for demonstration
- Mock data marked with comments for easy removal
- Design system fully implemented in `design_guidelines.md`
- Forms are controlled components with validation ready
- Responsive design works on all screen sizes
- Dark mode fully functional across all pages

## Recent Updates (November 2025)

### Authentication Flow
- Removed admin button from landing page
- Admin access restricted to `/admin` route only
- Password: `Admin@123`
- Improved login UI for both client and admin

### Body Composition Tools
- Comprehensive calculator integrated into client profile
- Calculates BMI, BMR, TDEE, and ideal weight
- Provides goal-based calorie recommendations

### Plan Generators
- Workout plan generator with 5 templates
- Diet plan generator with 5 diet types
- Both export to downloadable text files
- Validation prevents empty file downloads
