# Prathmik Kumarshala - School Management System

A modern, secure, and responsive school management website with separate Admin and Student dashboards.

## Features

### Admin Dashboard
- Dashboard overview with statistics
- Students Management (Add/Edit/Delete, Bulk upload)
- Staff Management
- Attendance Management
- Results Management
- Announcements / Notices
- Gallery Management
- Website Content Control

### Student Dashboard
- Personal profile
- Attendance percentage
- View/download results
- Staff information
- School notices
- Gallery access

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firestore (configured)
- **Storage**: Firebase Storage (configured)
- **Hosting**: Vercel

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your Firebase config:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Demo Credentials

- **Admin**: admin@school.com / admin123
- **Student**: student@school.com / student123

## Project Structure

```
src/
├── app/
│   ├── api/          # API routes
│   ├── admin/        # Admin dashboard pages
│   ├── student/      # Student dashboard pages
│   ├── login/        # Login page
│   └── ...
├── components/
│   ├── admin/        # Admin components
│   ├── student/      # Student components
│   └── ui/           # Shared UI components
├── context/          # React contexts
├── lib/             # Utility functions
└── types/           # TypeScript types
```

## License

MIT
