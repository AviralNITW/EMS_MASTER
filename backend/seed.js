import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Admin schema with embedded employees (inline definition for seeding)
const taskSchema = new mongoose.Schema({
  active: { type: Boolean, default: false },
  newTask: { type: Boolean, default: true },
  completed: { type: Boolean, default: false },
  failed: { type: Boolean, default: false },
  verificationStatus: { 
    type: String, 
    // Align with runtime Admin model: allow '', 'none', 'pending', 'verified', 'rejected'
    enum: ['pending', 'verified', 'rejected', 'none', ''],
    default: ''
  },
  taskTitle: { type: String, required: true },
  taskDescription: { type: String, required: true },
  taskDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Design', 'Development', 'Meeting', 'QA', 'Documentation', 'DevOps', 'Presentation', 'Support']
  },
  submittedDocuments: [{
    fileName: String,
    originalName: String,
    filePath: String,
    fileSize: Number,
    mimeType: String,
    uploadedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const employeeSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  taskCounts: {
    active: { type: Number, default: 0 },
    newTask: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    failed: { type: Number, default: 0 }
  },
  tasks: [taskSchema]
}, { timestamps: true });

// Method to update task counts
employeeSchema.methods.updateTaskCounts = function() {
  this.taskCounts.completed = this.tasks.filter(task => task.completed === true).length;
  this.taskCounts.failed = this.tasks.filter(task => task.failed === true && task.completed !== true).length;
  this.taskCounts.active = this.tasks.filter(task => task.active === true && task.completed !== true && task.failed !== true).length;
  this.taskCounts.newTask = this.tasks.filter(task => task.newTask === true && task.active !== true && task.completed !== true && task.failed !== true).length;
};

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  employees: [employeeSchema]
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed data
const seedData = [
  {
    name: 'Main Admin',
    email: 'admin@example.com',
    password: '123',
    employees: [
      {
        firstName: 'John',
        email: 'e@e.com',
        password: '123',
        tasks: [
          {
            taskTitle: 'Design Homepage Layout',
            taskDescription: 'Create a modern and responsive homepage layout',
            taskDate: new Date('2024-01-15'),
            endDate: new Date('2024-01-25'),
            category: 'Design',
            status: 'pendingVerification',
            newTask: false,
            active: false,
            completed: false,
            failed: false,
            verificationStatus: 'pending',
            submittedAt: new Date('2024-01-24'),
            submittedDocuments: [{
              fileName: 'design-document.pdf',
              originalName: 'design-document.pdf',
              filePath: '/uploads/design-document.pdf',
              fileSize: 1024,
              mimeType: 'application/pdf'
            }]
          },
          {
            taskTitle: 'API Integration',
            taskDescription: 'Integrate payment gateway API',
            taskDate: new Date('2024-01-20'),
            endDate: new Date('2024-01-30'),
            status: 'pendingVerification',
            verificationStatus: 'pending',
            submittedAt: new Date('2024-01-29'),
            submittedDocuments: [{
              fileName: 'api-documentation.pdf',
              originalName: 'api-documentation.pdf',
              filePath: '/uploads/api-documentation.pdf',
              fileSize: 2048,
              mimeType: 'application/pdf'
            }],
            category: 'Development',
            newTask: true,
            active: false,
            completed: false,
            failed: false
          },
          {
            taskTitle: 'Database Setup',
            taskDescription: 'Set up MongoDB database',
            taskDate: new Date('2024-01-10'),
            endDate: new Date('2024-01-15'),
            category: 'Development',
            status: 'completed',
            newTask: false,
            active: false,
            completed: true,
            failed: false,
            verificationStatus: 'approved',
            verifiedAt: new Date('2024-01-14'),
            submittedDocuments: [{
              fileName: 'database-schema.pdf',
              originalName: 'Database Schema.pdf',
              filePath: '/uploads/database-schema.pdf',
              fileSize: 1024000,
              mimeType: 'application/pdf'
            }]
          }
        ]
      },
      {
        firstName: 'Sarah',
        email: 'sarah@company.com',
        password: '123',
        tasks: [
          {
            taskTitle: 'User Testing',
            taskDescription: 'Conduct user testing sessions',
            taskDate: new Date('2024-01-18'),
            endDate: new Date('2024-01-28'),
            category: 'QA',
            status: 'active',
            newTask: false,
            active: true,
            completed: false,
            failed: false
          },
          {
            taskTitle: 'Documentation Update',
            taskDescription: 'Update user documentation',
            taskDate: new Date('2024-01-22'),
            endDate: new Date('2024-02-01'),
            category: 'Documentation',
            status: 'new',
            newTask: true,
            active: false,
            completed: false,
            failed: false
          }
        ]
      },
      {
        firstName: 'Mike',
        email: 'mike@company.com',
        password: '123',
        tasks: [
          {
            taskTitle: 'Security Audit',
            taskDescription: 'Perform security audit',
            taskDate: new Date('2024-01-25'),
            endDate: new Date('2024-02-05'),
            category: 'DevOps',
            status: 'new',
            newTask: true,
            active: false,
            completed: false,
            failed: false
          },
          {
            taskTitle: 'Server Setup',
            taskDescription: 'Set up production server',
            taskDate: new Date('2024-01-12'),
            endDate: new Date('2024-01-18'),
            category: 'DevOps',
            newTask: false,
            active: false,
            completed: true,
            failed: false,
            submittedDocuments: [{
              fileName: 'server-config.txt',
              originalName: 'Server Config.txt',
              filePath: '/uploads/server-config.txt',
              fileSize: 2048,
              mimeType: 'text/plain'
            }]
          },
          {
            taskTitle: 'Performance Optimization',
            taskDescription: 'Optimize application performance',
            taskDate: new Date('2024-01-08'),
            endDate: new Date('2024-01-15'),
            category: 'Development',
            status: 'expired',
            newTask: false,
            active: false,
            completed: false,
            failed: true,
            verificationStatus: 'rejected'
          }
        ]
      }
    ]
  }
];

// Main seeding function
const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🧹 STEP 1: Deleting existing database structure...');
    
    // Drop the entire database to start fresh
    await mongoose.connection.db.dropDatabase();
    console.log('   ✅ Database completely deleted');

    console.log('\n🌱 STEP 2: Creating new embedded structure...');

    // Create admins with embedded employees
    for (const adminData of seedData) {
      console.log(`   Creating admin: ${adminData.email}`);
      
      const admin = new Admin(adminData);
      
      // Update task counts for each employee
      admin.employees.forEach(employee => {
        employee.updateTaskCounts();
        console.log(`     Employee: ${employee.firstName} - ${employee.tasks.length} tasks`);
      });
      
      await admin.save();
      console.log(`   ✅ Admin ${adminData.email} created with ${adminData.employees.length} employees`);
    }

    console.log('\n📊 STEP 3: Verification...');
    const allAdmins = await Admin.find({});
    
    for (const admin of allAdmins) {
      console.log(`\n👤 Admin: ${admin.email}`);
      console.log(`   👥 Employees: ${admin.employees.length}`);
      
      admin.employees.forEach((emp, index) => {
        console.log(`     ${index + 1}. ${emp.firstName} (${emp.email})`);
        console.log(`        📋 Tasks: ${emp.tasks.length} | New:${emp.taskCounts.newTask} Active:${emp.taskCounts.active} Completed:${emp.taskCounts.completed} Failed:${emp.taskCounts.failed}`);
      });
    }

    console.log('\n✅ DATABASE SEEDED SUCCESSFULLY!');
    console.log('\n🔐 Login Credentials:');
    console.log('   Admin 1: admin@example.com / 123 (3 employees)');
    console.log('   Admin 2: admin2@example.com / 123 (1 employee)');
    console.log('   Employee: e@e.com / 123');
    console.log('\n🎯 Each admin now has completely isolated employee data!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

// Run the seeding
seedDatabase();
