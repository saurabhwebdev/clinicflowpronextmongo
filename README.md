# ClinicFlow - Healthcare Management System

A comprehensive, modern clinic management system built with Next.js, MongoDB, and advanced healthcare workflow automation. Streamline your healthcare practice with powerful patient management, appointment scheduling, billing, inventory tracking, and communication tools.

![ClinicFlow Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15.4.5-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## 🚀 Live Demo

**Production URL**: [Your Vercel Deployment URL]

**Demo Credentials**:
- Master Admin: Create using the admin script
- Test login available after setup

## ✨ Key Features

### 👥 **User Management & Authentication**
- **Role-based Access Control** (Master Admin, Admin, Doctor, Patient)
- **Secure Authentication** with NextAuth.js
- **Password Management** with forced password changes
- **User Profile Management** with customizable settings

### 📅 **Appointment Management**
- **Interactive Calendar** for scheduling appointments
- **Appointment Status Tracking** (Scheduled, Completed, Cancelled)
- **Patient-Doctor Assignment** with availability management
- **Automated Email Notifications** for appointments

### 🏥 **Patient Records & EHR**
- **Electronic Health Records** (EHR) management
- **Patient Demographics** and contact information
- **Medical History Tracking** with detailed records
- **Prescription Management** with medication tracking
- **Document Upload** and file management

### 💰 **Billing & Financial Management**
- **Invoice Generation** with PDF export
- **Payment Tracking** and status management
- **Multi-Currency Support** with automatic conversion
- **Financial Reports** and analytics
- **Insurance Claims** processing

### 📦 **Inventory Management**
- **Medical Supply Tracking** with stock levels
- **Automated Reorder Alerts** for low inventory
- **Supplier Management** and purchase orders
- **Inventory Reports** and analytics
- **Barcode/SKU Support** for easy tracking

### 📧 **Communication System**
- **Email Templates** for automated communications
- **Bulk Email Campaigns** for patient outreach
- **Email Logs** and delivery tracking
- **Appointment Reminders** via email
- **Custom Email Composer** with rich text editing

### 📊 **Analytics & Reporting**
- **Dashboard Analytics** with key metrics
- **Financial Reports** and revenue tracking
- **Patient Statistics** and demographics
- **Appointment Analytics** and trends
- **Inventory Reports** and usage patterns

### ⚙️ **System Administration**
- **Clinic Settings** and configuration
- **User Role Management** with permissions
- **System Health Monitoring** with API endpoints
- **Data Backup** and export capabilities
- **Audit Logs** for system activities

## 🛠️ Technology Stack

### **Frontend**
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern UI component library
- **Lucide React** - Beautiful icons

### **Backend**
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB object modeling
- **NextAuth.js** - Authentication solution

### **Additional Tools**
- **jsPDF** - PDF generation for invoices
- **Nodemailer** - Email sending capabilities
- **bcryptjs** - Password hashing
- **date-fns** - Date manipulation utilities

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.x or later
- **MongoDB Atlas** account (or local MongoDB)
- **Gmail** account for email functionality
- **Git** for version control

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/saurabhwebdev/clinicflowpronextmongo.git
cd clinicflowpronextmongo
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create `.env.local` file in the root directory:

```env
# Database Configuration
# For local MongoDB (uncomment to use local database)
# MONGODB_URI=mongodb://localhost:27017/clinicflownext

# For MongoDB Atlas (currently active)
MONGODB_URI=mongodb+srv://iamsaurabhthakur29:qyZkotKZVUuE6Tu7@cluster0.l69za6n.mongodb.net/clinicflow?retryWrites=true&w=majority&appName=Cluster0

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=clinicflow-super-secret-key-2024-production-ready

# Gmail Configuration
GMAIL_USER=worlddj0@gmail.com
GMAIL_APP_PASSWORD=uyos btpm rvsn toxt

# App Configuration
NODE_ENV=development
```

4. **Create Master Admin User**
```bash
npm run create-admin
```
Follow the prompts to create your first admin account.

5. **Start Development Server**
```bash
npm run dev
```

6. **Open Application**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
clinicflowpronextmongo/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Main application pages
│   │   └── admin/             # Admin panel
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Base UI components
│   │   └── billing/          # Feature-specific components
│   ├── lib/                   # Utility functions
│   │   ├── mongodb.ts        # Database connection
│   │   ├── email.ts          # Email utilities
│   │   └── currency.ts       # Currency handling
│   ├── models/               # MongoDB/Mongoose models
│   │   ├── User.ts           # User model
│   │   ├── Patient.ts        # Patient model
│   │   ├── Appointment.ts    # Appointment model
│   │   └── Bill.ts           # Billing model
│   ├── hooks/                # Custom React hooks
│   └── scripts/              # Utility scripts
├── public/                   # Static assets
├── .env.local               # Environment variables
├── next.config.mjs          # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── package.json             # Dependencies and scripts
```

## 👥 User Roles & Permissions

### 🔑 **Master Admin**
- **Full System Access** - Complete control over all features
- **User Management** - Create/edit/delete all user types
- **System Configuration** - Modify clinic settings and permissions
- **Data Management** - Access to all patient and system data

### 👨‍💼 **Admin**
- **User Management** - Create/manage doctors and patients
- **Clinic Operations** - Manage appointments, billing, inventory
- **Reports Access** - View analytics and generate reports
- **Limited System Access** - Cannot modify system-level settings

### 👨‍⚕️ **Doctor**
- **Patient Care** - Access to assigned patient records
- **Appointment Management** - View and manage their appointments
- **Prescription Writing** - Create and manage prescriptions
- **EHR Access** - Read/write electronic health records

### 🤒 **Patient**
- **Personal Records** - View their own medical records
- **Appointment Booking** - Schedule appointments with doctors
- **Prescription History** - View medication history
- **Profile Management** - Update personal information

## 📧 Email System

### **Automated Emails**
- **Welcome emails** for new users
- **Appointment confirmations** and reminders
- **Password reset** notifications
- **Billing invoices** and payment reminders

### **Email Templates**
- **Customizable templates** for different scenarios
- **Rich text editor** for email composition
- **Bulk email campaigns** for patient outreach
- **Email delivery tracking** and logs

## 💳 Billing & Payments

### **Invoice Management**
- **Professional PDF invoices** with clinic branding
- **Multi-currency support** with real-time conversion
- **Payment status tracking** (Paid, Pending, Overdue)
- **Automated payment reminders**

### **Financial Reporting**
- **Revenue analytics** with charts and graphs
- **Payment history** and transaction logs
- **Outstanding balances** and collections
- **Tax reporting** and financial summaries

## 📦 Inventory System

### **Stock Management**
- **Real-time inventory tracking** with current stock levels
- **Low stock alerts** and reorder notifications
- **Supplier management** with contact information
- **Purchase order generation**

### **Inventory Analytics**
- **Usage patterns** and consumption reports
- **Cost analysis** and budget tracking
- **Expiry date monitoring** for medications
- **Inventory valuation** reports

## 🔧 Development

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run create-admin # Create master admin user
```

### **Development Guidelines**
- **TypeScript** - All new code should be typed
- **Component Structure** - Use functional components with hooks
- **API Routes** - Follow RESTful conventions
- **Database** - Use Mongoose models for data operations
- **Styling** - Use Tailwind CSS classes

## 🚀 Deployment

### **Vercel Deployment** (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Connect to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Select Next.js framework

3. **Environment Variables**
Set these in your Vercel dashboard:
```
MONGODB_URI=mongodb+srv://iamsaurabhthakur29:qyZkotKZVUuE6Tu7@cluster0.l69za6n.mongodb.net/clinicflow?retryWrites=true&w=majority&appName=Cluster0
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=clinicflow-super-secret-key-2024-production-ready
GMAIL_USER=worlddj0@gmail.com
GMAIL_APP_PASSWORD=uyos btpm rvsn toxt
NODE_ENV=production
```

4. **Deploy**
Click "Deploy" and wait for the build to complete.

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🔒 Security Features

- **Password Hashing** with bcryptjs
- **JWT Authentication** with NextAuth.js
- **Role-based Access Control** (RBAC)
- **Input Validation** and sanitization
- **HTTPS Enforcement** in production
- **Environment Variable Protection**

## 🧪 Testing

### **API Testing**
- Health check endpoint: `/api/health`
- Test database connection: `/api/test-db`
- User authentication: `/api/debug/user`

### **Manual Testing Checklist**
- [ ] User registration and login
- [ ] Role-based access control
- [ ] Appointment scheduling
- [ ] Patient record management
- [ ] Billing and invoice generation
- [ ] Email notifications
- [ ] Inventory tracking

## 📚 API Documentation

### **Authentication Endpoints**
- `POST /api/auth/register` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/change-password` - Password change

### **Patient Management**
- `GET /api/patients` - List all patients
- `POST /api/patients` - Create new patient
- `GET /api/patients/[id]` - Get patient details
- `PUT /api/patients/[id]` - Update patient
- `DELETE /api/patients/[id]` - Delete patient

### **Appointment Management**
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/[id]` - Update appointment
- `DELETE /api/appointments/[id]` - Cancel appointment

### **Billing System**
- `GET /api/billing` - List all bills
- `POST /api/billing` - Create new bill
- `GET /api/billing/[id]` - Get bill details
- `GET /api/billing/[id]/pdf` - Download bill PDF

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### **Getting Help**
- **Documentation**: Check this README and [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Issues**: Open an issue on GitHub for bugs or feature requests
- **Email**: Contact the development team

### **Common Issues**
- **Database Connection**: Ensure MongoDB URI is correct
- **Email Not Sending**: Verify Gmail app password
- **Build Errors**: Check Node.js version (18.x+ required)
- **Authentication Issues**: Verify NEXTAUTH_SECRET is set

## 🎯 Roadmap

### **Upcoming Features**
- [ ] **Telemedicine Integration** - Video consultations
- [ ] **Mobile App** - React Native companion app
- [ ] **Advanced Analytics** - AI-powered insights
- [ ] **Multi-language Support** - Internationalization
- [ ] **API Integration** - Third-party service connections
- [ ] **Advanced Reporting** - Custom report builder

### **Version History**
- **v1.0.0** - Initial release with core features
- **v1.1.0** - Enhanced billing and inventory management
- **v1.2.0** - Email system and communication tools
- **v2.0.0** - Complete UI overhaul and performance improvements

---

**Built with ❤️ for healthcare professionals worldwide**

*ClinicFlow - Streamlining Healthcare Management*