# Police Population Management System

## Project Overview
The Police Population Management System is a web-based application designed to efficiently manage citizen records within police activities. The system enables user authentication, role-based access control, data visualization, administrative operations, and reporting functionalities to streamline police data management.

---

## Features

### 1. User Management
- Authentication & Registration:
  - Users must log in with a username and password.
  - New user registration is only allowed if they exist in the police database, verified via CNP (National Identification Number).
- Role-Based Access Control:
  - Regular Users can view their personal data and limited records.
  - Administrators have full database management privileges.

### 2. User Dashboard
- Personal Data: Name, surname, date of birth, CNP, phone number, marital status, gender.
- Identity Documents: Type, serial number, expiration date.
- Owned Vehicles: Brand, model, year of manufacture.
- Residential Addresses: County, city, street, apartment details, postal code.
- Criminal Record: List of offenses, date committed, sentence.
- Search Functionality: Users can search for individuals by name.

### 3. Administrator Dashboard
- Full Database Management:
  - Search for individuals by name or ID.
  - Edit personal details and associated records (addresses, vehicles, identity documents, criminal records, emergency contacts).
  - Delete records if necessary.
  - Add new individuals to the database.
- Generate Reports:
  - List of expired identity documents.
  - Top users by county based on associated events.
  - Most frequently used document types per region.
  - Details of the most recent criminal record case.
- Sorting and Filtering:
  - Alphabetical list of all registered vehicles.

### 4. Reports & Statistics
- Police event distribution across counties.
- Most popular document types per region.
- Expired identity documents report.
- Most recent case details in criminal records.
- Data is presented in interactive tables for easy analysis.

### 5. Advanced Features
- Security & Validation:
  - Input validation to prevent incorrect data entry.
  - Role-based access restrictions.
- User Interface:
  - Responsive and user-friendly design, accessible on any device.
  - Real-time feedback via notifications and visual indicators.
- Operational Optimization:
  - Fast search and filtering options.
  - Automated report generation.

### 6. Benefits & Impact
- Centralized population data management.
- Faster access to detailed citizen records for law enforcement.
- Reduction in manual data handling errors.

---

## Technologies Used

### Backend
- Node.js with mysql package for database connectivity.
- Express.js for API routing and CRUD operations.

### Database
- MySQL for structured storage of population records.
- Tables include: persons, addresses, criminal_records, identity_documents, vehicles, users, etc.

### Frontend
- HTML, CSS, JavaScript for a responsive user interface.
- Different dashboards for users and administrators.

### System Workflow
1. Users send requests via the web interface.
2. The server processes the request and interacts with the database.
3. Data is displayed in tables or as real-time notifications.
