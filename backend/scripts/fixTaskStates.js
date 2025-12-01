import mongoose from 'mongoose';
import Employee from '../models/Employee.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for data cleanup');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Fix task states to follow exclusive principle
const fixTaskStates = async () => {
  try {
    console.log('🔧 Starting task state cleanup...');
    
    // Get all employees
    const employees = await Employee.find({});
    console.log(`Found ${employees.length} employees to process`);
    
    let totalTasksFixed = 0;
    let totalEmployeesUpdated = 0;
    
    for (const employee of employees) {
      let employeeTasksFixed = 0;
      let employeeUpdated = false;
      
      console.log(`\n👤 Processing employee: ${employee.firstName} (${employee.email})`);
      console.log(`   Total tasks: ${employee.tasks.length}`);
      
      // Process each task
      for (const task of employee.tasks) {
        const originalState = {
          newTask: task.newTask,
          active: task.active,
          completed: task.completed,
          failed: task.failed
        };
        
        // Check if task violates exclusive principle
        const trueStates = Object.values(originalState).filter(Boolean).length;
        
        if (trueStates > 1) {
          console.log(`   🔍 Task "${task.taskTitle}" has ${trueStates} states true - FIXING`);
          console.log(`      Original: ${JSON.stringify(originalState)}`);
          
          // Apply exclusive state logic with priority: completed > failed > active > newTask
          if (task.completed) {
            task.newTask = false;
            task.active = false;
            task.completed = true;
            task.failed = false;
          } else if (task.failed) {
            task.newTask = false;
            task.active = false;
            task.completed = false;
            task.failed = true;
          } else if (task.active) {
            task.newTask = false;
            task.active = true;
            task.completed = false;
            task.failed = false;
          } else {
            // Default to newTask if none of the above
            task.newTask = true;
            task.active = false;
            task.completed = false;
            task.failed = false;
          }
          
          const newState = {
            newTask: task.newTask,
            active: task.active,
            completed: task.completed,
            failed: task.failed
          };
          
          console.log(`      Fixed to: ${JSON.stringify(newState)}`);
          employeeTasksFixed++;
          employeeUpdated = true;
        }
      }
      
      if (employeeUpdated) {
        // Update task counts using the fixed method
        employee.updateTaskCounts();
        await employee.save();
        
        console.log(`   ✅ Fixed ${employeeTasksFixed} tasks for ${employee.firstName}`);
        console.log(`   📊 New task counts:`, {
          newTask: employee.taskCounts.newTask,
          active: employee.taskCounts.active,
          completed: employee.taskCounts.completed,
          failed: employee.taskCounts.failed
        });
        
        totalTasksFixed += employeeTasksFixed;
        totalEmployeesUpdated++;
      } else {
        console.log(`   ✅ No fixes needed for ${employee.firstName}`);
      }
    }
    
    console.log('\n🎉 Task state cleanup completed!');
    console.log(`📈 Summary:`);
    console.log(`   - Employees processed: ${employees.length}`);
    console.log(`   - Employees updated: ${totalEmployeesUpdated}`);
    console.log(`   - Tasks fixed: ${totalTasksFixed}`);
    
  } catch (error) {
    console.error('❌ Error during task state cleanup:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the cleanup
const runCleanup = async () => {
  await connectDB();
  await fixTaskStates();
  process.exit(0);
};

runCleanup();
