# Secure Auth + Email OTP Assessment

A full-stack Login & Registration system with email OTP verification, account activation, secure password hashing, JWT authentication using an HttpOnly cookie, MySQL persistence, rate limiting, validation, and responsive React UI.



## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MySQL
- Authentication: JWT + HttpOnly cookie
- Password hashing: bcryptjs
- Email: Nodemailer / SMTP
- Validation: express-validator
- Rate limiting: express-rate-limit
  


## Application flow

Registration → Email OTP → OTP Verification → Account Activation → Login → Authenticated User → Logout



## Project structure

```text
auth-otp-assessment/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/authController.js
│   │   ├── middleware/authMiddleware.js
│   │   ├── middleware/errorMiddleware.js
│   │   ├── routes/authRoutes.js
│   │   ├── utils/email.js
│   │   ├── utils/otp.js
│   │   ├── utils/token.js
│   │   ├── validators/authValidators.js
│   │   └── server.js
│   ├── .env.example
│   ├── package.json
│   └── schema.sql
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env.example
│   ├── index.html
│   └── package.json
└── README.md
```


## 1. Database setup

Create a MySQL database and run `backend/schema.sql`.

Example:

```sql
SOURCE backend/schema.sql;
```

Or paste the SQL into MySQL Workbench.


## 2. Backend setup

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and configure:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=auth_otp_db

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM="SecureAuth <your_email@gmail.com>"
```


For Gmail, use a Google App Password rather than your normal Gmail password.

Start:

```bash
npm run dev
```


Backend runs at `http://localhost:5000`.



## 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```


Frontend runs at `http://localhost:5173`.



## 4. Testing the complete flow

1. Open the frontend.
2. Register with a real email address.
3. Check the email for the 6-digit OTP.
4. Enter the OTP.
5. Account becomes active.
6. Login with email/password.
7. Dashboard displays the authenticated user.
8. Refresh the page to verify the session persists.
9. Logout and verify protected access is removed.
10. Test wrong/expired OTP, password mismatch, duplicate email, invalid credentials, and resend limits.



## Security implemented

- Passwords are hashed with bcrypt and never stored as plaintext.
- OTP is stored as a SHA-256 hash, not plaintext.
- OTP expires after 10 minutes.
- OTP verification has a maximum number of attempts.
- Resend requests are rate-limited.
- Authentication token is stored in an HttpOnly cookie.
- JWT is signed with a server-side secret.
- Production cookies use `Secure`.
- Login and registration endpoints have rate limits.
- Secrets are loaded from environment variables.
- Sensitive values are not returned by APIs.
- SQL uses parameterized queries.
- Helmet adds common HTTP security headers.
- CORS is restricted to the configured frontend origin.
- Request body size is limited.
- Validation is performed on the backend.
