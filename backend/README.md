# EMS Backend API

Employee Management System Backend built with Node.js, Express, and MongoDB.

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env` file and update the values:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure secret key for JWT tokens
   - `PORT`: Server port (default: 5000)

4. Start MongoDB service (if using local MongoDB)

5. Seed the database with initial data:
```bash
node seedData.js
```

6. Start the server:
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/employee/login` - Employee login
- `POST /api/auth/admin/login` - Admin login

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Employee Tasks
- `POST /api/employees/:id/tasks` - Add task to employee
- `PUT /api/employees/:id/tasks/:taskId` - Update task
- `DELETE /api/employees/:id/tasks/:taskId` - Delete task

### Admin
- `GET /api/admin` - Get all admins
- `GET /api/admin/:id` - Get admin by ID
- `POST /api/admin` - Create new admin
- `PUT /api/admin/:id` - Update admin
- `DELETE /api/admin/:id` - Delete admin

### Health Check
- `GET /api/health` - Server health status

## Default Login Credentials

### Admin
- Email: admin@example.com
- Password: 123

### Employees
- Email: e@e.com (Arjun) - Password: 123
- Email: employee2@example.com (Sneha) - Password: 123
- Email: employee3@example.com (Ravi) - Password: 123
- Email: employee4@example.com (Priya) - Password: 123
- Email: employee5@example.com (Karan) - Password: 123

## Database Schema

### Employee
- firstName: String
- email: String (unique)
- password: String
- taskCounts: Object (active, newTask, completed, failed)
- tasks: Array of Task objects

### Task
- taskTitle: String
- taskDescription: String
- taskDate: Date
- endDate: Date
- category: String
- active: Boolean
- newTask: Boolean
- completed: Boolean
- failed: Boolean

### Admin
- email: String (unique)
- password: String
