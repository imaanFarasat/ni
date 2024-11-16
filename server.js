const mongoose = require('mongoose');

// MongoDB URI from environment variable (use your MongoDB connection string here)
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster0.oy88e.mongodb.net/martial?retryWrites=true&w=majority';

// Function to handle MongoDB connection
let cachedDb = null;

const connectToDatabase = async () => {
    if (cachedDb) {
        return cachedDb;
    }
    try {
        const db = await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        cachedDb = db;
        console.log('MongoDB Connected');
        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

// Define the schema for storing form data
const businessSchema = new mongoose.Schema({
    businessName: String,
    studioLocation: String,
    operationDuration: String,
    ownership: String,
    squareFootage: String,
});

// Create the model based on the schema
const Business = mongoose.model('Business', businessSchema);

// Export Vercel serverless function handler
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            // Connect to the database
            await connectToDatabase();

            // Handle form submission
            const { businessName, studioLocation, operationDuration, ownership, squareFootage } = req.body;

            // Validate the data
            if (!businessName || !studioLocation || !operationDuration || !ownership || !squareFootage) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required',
                });
            }

            const newBusiness = new Business({
                businessName,
                studioLocation,
                operationDuration,
                ownership,
                squareFootage,
            });

            // Save the data to MongoDB
            await newBusiness.save();

            // Send success response
            return res.status(200).json({
                success: true,
                message: 'Data saved successfully',
            });
        } catch (error) {
            console.error('Error saving form data:', error);
            return res.status(500).json({
                success: false,
                message: 'Error saving data, please try again',
            });
        }
    } else {
        // Handle non-POST requests
        return res.status(405).json({
            success: false,
            message: 'Method Not Allowed',
        });
    }
};
