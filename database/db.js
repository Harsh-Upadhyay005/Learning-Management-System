import mongoose from 'mongoose';
import dotenv from 'dotenv';

const MAX_RETRIES = 5;
const RETRY_INTERVAL = 2000; // 2 seconds


class DatabaseConnection {
    constructor() {
        this.retryCount = 0;
        this.isConnected = false;

        // configure mongoose to use strict query mode
        mongoose.set("strictQuery", true);
        mongoose.connection.on('connected', () => {
            console.log('MongoDB connected successfully');
            this.isConnected = true;
        });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
            this.isConnected = false;

        },);
        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected');
            this.handleDisconnect();
        });

        process.on('SIGTERM', this.handleAppTermination.bind(this));
        process.on('SIGINT', this.handleAppTermination.bind(this));
    }

    async connect() {
        try {
            if(!process.env.MONGO_URI) {
            console.error('MONGO_URI is not defined in environment variables');
            return;
        }

        const connectionOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10, // Adjust based on your application's needs
            serverSelectionTimeoutMS: 5000, // 5 seconds timeout for initial connection
            socketTimeoutMS: 45000, // 45 seconds timeout for socket inactivity
            family: 4, // Use IPv4, skip trying IPv6
        };

        if(process.env.NODE_ENV === 'development') {
            mongoose.set('debug', true);
        }

        await mongoose.connect(process.env.MONGO_URI, connectionOptions);
        this.retryCount = 0; // reset retry count on successful connection
        }
        catch (err) {
            console.error('Error connecting to MongoDB:', err);
            await this.handleConnectionError(err);
        }
    }

        async handleConnectionError(err) {
            if (this.retryCount < MAX_RETRIES) {
                this.retryCount++;
                console.warn(`Retrying MongoDB connection (${this.retryCount}/${MAX_RETRIES})...`);
                await new Promise(resolve => setTimeout(() => resolve(), RETRY_INTERVAL));
                return this.connect();
            }
            else {
                console.error('Max retries reached. Could not connect to MongoDB.');
                process.exit(1); // Exit the application if unable to connect to the database
            }
                
        }

        async handleDisconnect() {
            if(!this.isConnected) {
                console.warn('Attempting to reconnect to MongoDB...');
                await this.connect();
            }
        }

        async handleAppTermination() {
            try {
                await mongoose.connection.close();
                console.log('MongoDB connection closed due to application termination');
                process.exit(0);
            }
            catch (err) {
                console.error('Error closing MongoDB connection:', err);
                process.exit(1);
            }
        }

        getConnectionStatus() {
            return {
                isConnected: this.isConnected,
                readyState: mongoose.connection.readyState,
                host: mongoose.connection.host,
                port: mongoose.connection.port,
                name: mongoose.connection.name,
            }
        }
}


// create a singleton instance of the DatabaseConnection class

const databaseConnection = new DatabaseConnection();

export default databaseConnection.connect.bind(databaseConnection);
export const getDBStatus = databaseConnection.getConnectionStatus.bind(databaseConnection);

