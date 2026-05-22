# Quick Setup Guide

## Step 1: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Step 2: Configure Environment Variables

Create a `.env` file in the `backend` directory with the following:

```env
MONGO_URI_COMPASS=mongodb://localhost:27017/sturum
PORT=4000
SECRET=your_secret_key_here
```

**Important:**
- Replace `mongodb://localhost:27017/sturum` with your MongoDB connection string
- For MongoDB Atlas, use: `mongodb+srv://username:password@cluster.mongodb.net/sturum`
- Generate a random secret key (you can use any random string)

## Step 3: Start MongoDB

Make sure MongoDB is running:
- **Local MongoDB**: Start MongoDB service
- **MongoDB Atlas**: No action needed, just ensure your connection string is correct

## Step 4: Run the Application

### Terminal 1 - Backend
```bash
cd backend
npm start
```
Backend will run on: http://localhost:4000

### Terminal 2 - Frontend
```bash
cd frontend
npm start
```
Frontend will open automatically at: http://localhost:3000

## That's it! 🎉

The application should now be running. You can:
1. Visit http://localhost:3000 to see the landing page
2. Sign up for a new account
3. Start using the platform!

## Troubleshooting

- **Backend won't start**: Check MongoDB connection and .env file
- **Frontend can't connect**: Ensure backend is running on port 4000
- **Port already in use**: Change PORT in .env file
