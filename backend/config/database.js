import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

const connectDB = async (retries = 3, delay = 2000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Attempting to connect to MongoDB... (Attempt ${attempt}/${retries})`);
      
      if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI is not set in environment variables');
        console.error('Please create a .env file in the backend directory with:');
        console.error('MONGODB_URI=your_connection_string_here');
        process.exit(1);
      }
      
      console.log('Connection string:', process.env.MONGODB_URI ? 'Found' : 'Missing');
      
      // Test DNS resolution if using mongodb+srv
      if (process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
        try {
          const hostname = process.env.MONGODB_URI.match(/mongodb\+srv:\/\/[^@]+@([^/]+)/)?.[1];
          if (hostname) {
            console.log(`Testing DNS resolution for: ${hostname}`);
            await dns.promises.resolveSrv(`_mongodb._tcp.${hostname}`);
            console.log('✅ DNS resolution successful');
          }
        } catch (dnsError) {
          console.warn('⚠️  DNS resolution warning:', dnsError.message);
          console.warn('This might indicate network or DNS issues.');
        }
      }
      
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000, // Increased to 10 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        connectTimeoutMS: 10000, // 10 second connection timeout
        family: 4, // Use IPv4, skip trying IPv6
        maxPoolSize: 10, // Maintain up to 10 socket connections
        retryWrites: true,
        w: 'majority',
        serverApi: {
          version: '1',
          strict: true,
          deprecationErrors: true,
        }
      });
      
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      console.log(`Database Name: ${conn.connection.name}`);
      
      // Test the connection
      const admin = new mongoose.mongo.Admin(conn.connection.db);
      const serverStatus = await admin.serverStatus();
      console.log('MongoDB Server Status:', serverStatus.ok === 1 ? 'OK' : 'Error');
      
      return; // Success, exit the retry loop
      
    } catch (error) {
      console.error(`❌ Database connection error (Attempt ${attempt}/${retries}):`, error.message);
      
      if (error.code === 'ENOTFOUND' || error.message.includes('querySrv ENOTFOUND')) {
        console.error('\n🔍 DNS Resolution Error Detected');
        console.error('Possible causes:');
        console.error('  1. Network connectivity issues');
        console.error('  2. DNS server problems');
        console.error('  3. Firewall blocking DNS queries');
        console.error('  4. MongoDB Atlas cluster might be paused or deleted');
        console.error('  5. VPN or proxy interfering with DNS');
        console.error('\n💡 Troubleshooting steps:');
        console.error('  - Check your internet connection');
        console.error('  - Try disabling VPN if active');
        console.error('  - Verify MongoDB Atlas cluster is running');
        console.error('  - Check firewall settings');
        console.error('  - Try using a different DNS server (e.g., 8.8.8.8)');
      }
      
      if (attempt < retries) {
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 1.5; // Exponential backoff
      } else {
        console.error('\nError details:', {
          name: error.name,
          code: error.code,
          codeName: error.codeName,
          errorLabels: error.errorLabels,
          stack: error.stack
        });
        console.error('\n❌ Failed to connect after', retries, 'attempts');
        process.exit(1);
      }
    }
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');});

// Close the Mongoose connection when the Node process ends
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose connection closed through app termination');
  process.exit(0);
});

export default connectDB;
