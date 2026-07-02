# 🎖️ NSUT NCC Digital Platform

A comprehensive, digital management platform for **Netaji Subhas University of Technology (NSUT) NCC**. This application modernizes and centralizes the administration of NCC workflows, replacing manual record-keeping with a unified digital ecosystem for both cadets and administrators.

---

## 🎯 Project Overview

The NSUT NCC Digital Platform is designed to streamline daily NCC activities, improve communication, and efficiently manage cadet records. 

### Why this platform was built?
Previously, NCC administrative tasks like tracking attendance, managing cadet records, and announcing events were handled manually or via disjointed communication channels. This led to inefficiencies, data loss, and delays. 

### Benefits for NSUT NCC
- **Centralized Data:** All cadet information, from nominal rolls to attendance, is stored in a secure, centralized database.
- **Role-Based Access:** Distinct experiences for regular Cadets and Administrators.
- **Resource Accessibility:** Cadets can easily access study materials, uniform guides, and rank structures in one place.
- **Efficiency:** Automated nominal roll imports and digital attendance tracking save hours of administrative work.

---

## ✨ Features

### 🔐 Authentication
- Secure Login & Signup for Cadets.
- Password encryption using `bcrypt`.
- Secure session management via `iron-session`.
- Forgot/Reset Password via email verification codes.

### 🛡️ Admin Features
- **Admin Dashboard:** Central hub for administrative tasks.
- **Nominal Roll Management:** Import cadet lists directly from Excel spreadsheets (`.xlsx`) to easily manage cadet records.
- **Attendance Management:** Track and monitor cadet attendance for various parades and camps.
- **Make Admin:** Elevate other cadets to administrative roles.
- **Manage Achievements:** Add, edit, or remove achievements showcased on the public platform.

### 🧑‍✈️ Cadet Features
- **Cadet Dashboard:** Personalized view for cadets.
- **Cadet Directory:** View peers and fellow cadets.

### 📚 Resources & Guides
- **Uniform Guide:** Detailed visual instructions on proper uniform wearing.
- **Rank Structure:** Comprehensive breakdown of NCC ranks.
- **Study Resources:** Materials for B & C certificate examinations.
- **Drills:** (Coming Soon) Training and drill guides.

### 📸 Public Showcases
- **Events & Camps:** Information about upcoming events and ongoing camps.
- **Camp Gallery:** Photo galleries from various NCC camps (e.g., SNIC, CATC).
- **Notice Board / Contact:** Stay updated with unit announcements.

### 💻 UI/UX
- **Responsive Design:** Optimized for both mobile and desktop screens.
- **Dynamic Animations:** Immersive user experience built with `GSAP` and `Three.js` (React Three Fiber).
- **Glassmorphism:** Modern, sleek aesthetic throughout the application.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** [Next.js 15](https://nextjs.org/) (App Router & Dynamic SPA)
- **Library:** React 19, React Router v7
- **Styling:** Tailwind CSS (with PostCSS & Autoprefixer)
- **Animations:** GSAP, React Three Fiber, React Three Drei

### Backend
- **Framework:** Next.js Serverless API Routes (`src/app/api`)
- **Authentication:** `iron-session`, `bcryptjs`
- **File Handling:** `multer`
- **Excel Parsing:** `exceljs`
- **Emails:** `nodemailer`

### Database
- **Engine:** MySQL (using `mysql2` package)
- **Migration:** Auto-migration scripts on startup

---

## 🗂️ Project Architecture

The project seamlessly integrates a React SPA inside the Next.js App Router for optimal routing and backend API support.

```text
NSUTNCC/
├── lib/                      # Backend services and config
│   ├── auth.ts               # iron-session configuration
│   ├── db.ts                 # MySQL connection pool
│   ├── ensureTables.ts       # Database schema initialization
│   ├── mail.ts               # Nodemailer setup
│   └── helpers.ts            # Utility functions
├── public/                   # Static assets (images, models)
├── src/                      
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # Serverless API routes (auth, admin, cadets, etc.)
│   │   └── [[...slug]]/      # Catch-all route to mount React SPA
│   ├── assets/               # Frontend assets
│   ├── components/           # Reusable UI components (Nav, Footer, Loading)
│   ├── contexts/             # React Contexts (AuthContext)
│   ├── hooks/                # Custom React hooks
│   ├── layouts/              # Main layout wrappers
│   ├── spa-pages/            # React Router views (Home, Admin, Cadets, etc.)
│   ├── utils/                # Frontend API clients
│   ├── App.jsx               # React Router definitions
│   └── ReactApp.jsx          # SPA entry point
├── .env.local                # Environment variables
├── next.config.mjs           # Next.js configuration
├── package.json              # Dependencies
└── tailwind.config.js        # Tailwind styling configuration
```

---

## 🗄️ Database Overview

The application uses **MySQL**. Key entities include:

- **`users`**: Stores cadet information, email, DLI number, password hashes, and admin status.
- **`password_reset_tokens`**: Manages secure tokens for the "Forgot Password" flow.
- **`achievements`**: Stores showcase details like title, description, and image paths.

*(Note: The database automatically initializes missing tables and seeds initial achievements upon the first request via `ensureTables.ts`)*

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MySQL Server

### 1. Clone the repository
```bash
git clone https://github.com/Sumit9711/NSUTNCC.git
cd NSUTNCC
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory based on the following template:

```env
# MySQL Database Config
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=nsut_ncc

# Session Configuration (Must be at least 32 characters)
SESSION_SECRET=ncc-dev-secret-change-in-production-min-32-chars!!

# Mail Configuration (For password reset emails)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_DEFAULT_SENDER=your_email@gmail.com

# Admin Configuration
ADMIN_DLI=DL2024SDIA1440189
RESET_TOKEN_EXPIRY_MINUTES=15
```

### 4. Database Setup
Create the MySQL database in your local/remote server:
```sql
CREATE DATABASE nsut_ncc;
```
*(The tables will be automatically created when you run the application)*

### 5. Run the Application
```bash
npm run dev
```
The platform will be available at `http://localhost:3000`.

---

## 📖 Usage

### For Cadets
1. Register using your DLI Number and Email on the `/auth` page.
2. Log in to access the **Cadet Dashboard**.
3. Browse study materials, uniform guides, and rank structures.
4. View upcoming camps and the event gallery.

### For Administrators
1. Ensure your DLI matches the `ADMIN_DLI` environment variable or be promoted by an existing admin.
2. Log in to access the **Admin Dashboard**.
3. Navigate to **Nominal Roll** to upload Excel sheets containing cadet data.
4. Use **Attendance Management** to log cadet attendance for events.
5. Use **Make Admin** to assign administrative privileges to other reliable cadets.
6. Use **Manage Achievements** to feature outstanding cadets on the homepage.

---

## 🔮 Future Scope

- **Advanced Analytics:** Interactive charts for attendance trends.
- **Automated Alerts:** SMS/Email notifications for upcoming parades or uniform changes.
- **Inventory Management:** Track NCC uniform and equipment issuance.
- **Drills Section:** Comprehensive video and text guides for drill commands.
- **Mobile Application:** A native React Native app bridging the current web APIs.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check [issues page](https://github.com/Sumit9711/NSUTNCC/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🧑‍💻 Author

**Sumit** - [Sumit9711](https://github.com/Sumit9711)

---
*Developed with dedication for NSUT NCC.* 🇮🇳
