# Online Coding Assessment System

A secure and scalable **Online Coding Assessment System** built using the **MERN Stack**, integrated with **Judge0 API**, **JWT Authentication**, **Google Sign-In**, and **Email OTP Verification**. Designed for **colleges and companies** to conduct reliable and efficient coding evaluations.

---

## Features

### Admin Role

* Add coding questions to the platform
* Define problem constraints and test cases
* Organize assessments using predefined question sets
* View candidate submissions and results
* Monitor overall performance

>  *Note: Only Admins have permission to add questions.*

---

### User Role (Student / Candidate)

* Register/Login using Email or Google Sign-In
* Secure registration with **Email OTP Verification**
* Attempt coding assessments
* Write, compile, and run code in real-time
* View results and submission history

---

## Authentication & Verification

* **JWT-based Authentication** for secure sessions
* **Google OAuth 2.0 Sign-In**
* **Email OTP Verification** during registration to ensure valid users
* Role-based access control (Admin/User)
* Protected APIs and routes

---

## Tech Stack

### Frontend

* React.js
* Axios

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Integrations

* Judge0 API (code execution)
* Google OAuth (authentication)
* Email Service (OTP verification)

---

## Project Structure

```id="x7n1vz"
/client        -> React frontend
/server        -> Express backend
/models        -> MongoDB schemas
/routes        -> API routes
/controllers   -> Business logic
/middleware    -> Auth & role validation
/utils         -> OTP & email handling
```

---

## Workflow

1. User registers with email
2. OTP is sent to email for verification
3. After verification, user can log in
4. Admin adds coding questions
5. Users attempt assessments
6. Code execution handled via Judge0 API
7. Results are stored and displayed

---

## Use Cases

* College placement assessments
* Company hiring tests
* Coding competitions
* Skill evaluation platforms

---

## Future Enhancements

* AI-based plagiarism detection
* Live proctoring system
* Advanced analytics dashboard
* Timed section-based tests
* Multi-language support expansion

---

## Contact

* Email: suhaibu012@gmail.com
* GitHub: https://github.com/Suhaibu-003

## Link For Website
https://coding-assement-system.vercel.app/
