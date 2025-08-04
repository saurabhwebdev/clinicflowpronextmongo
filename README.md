# ClinicFlow Pro

A Next.js clinic management system with MongoDB, NextAuth, and role-based access control.

## Features

- User authentication with NextAuth
- Role-based access control (Master Admin, Admin, Doctor, Patient)
- User management system
- Email notifications
- Password reset functionality
- Responsive UI with Tailwind CSS and Shadcn UI components

## Getting Started

### Prerequisites

- Node.js 18.x or later
- MongoDB database
- Gmail account for sending emails (or other email service)

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# MongoDB Atlas
MONGODB_URI=mongodb+srv://iamsaurabhthakur29:qyZkotKZVUuE6Tu7@cluster0.l69za6n.mongodb.net/docudocflask?retryWrites=true&w=majority&appName=Cluster0

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=clinicflow-super-secret-key-2024-production-ready

# Email (Gmail)
GMAIL_USER=worlddj0@gmail.com
GMAIL_APP_PASSWORD=uyos btpm rvsn toxt

# Environment
NODE_ENV=development
```

For production deployment on Vercel, see [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/clinicflowpro.git
cd clinicflowpro
```

2. Install dependencies:

```bash
npm install
```

3. Create the first master admin user:

```bash
npm run create-admin
```

Follow the prompts to create the master admin account.

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## User Roles and Permissions

### Master Admin
- Full access to all features
- Can create other master admins
- Can manage all users and roles

### Admin
- Can create and manage doctors and patients
- Cannot create master admins
- Access to administrative features

### Doctor
- Access to patient records
- Appointment management
- Limited administrative access

### Patient
- View and manage own appointments
- Access to personal health records
- No administrative access

## User Management

Admins can create new users through the admin panel. When a new user is created:

1. The system generates a temporary password
2. An email is sent to the user with their login credentials
3. On first login, users are required to change their password
4. After changing their password, they gain access to their dashboard

## Development

This project uses:

- Next.js 15 with App Router
- MongoDB with Mongoose
- NextAuth for authentication
- Tailwind CSS for styling
- Shadcn UI components

### Folder Structure

- `/src/app` - Next.js app router pages
- `/src/components` - React components
- `/src/lib` - Utility functions and services
- `/src/models` - Mongoose models
- `/src/types` - TypeScript type definitions
- `/src/scripts` - Utility scripts

## License

[MIT](LICENSE)