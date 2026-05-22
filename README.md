# Sturum - Social Networking Platform for Students

A full-stack social networking platform designed for students in marine-related fields, combining blog and forum functionality.

## Features

- 🔐 User Authentication (Signup/Login)
- 📝 Social Feed with Posts, Likes, and Comments
- 📚 Study Materials Sharing (Past Questions, Handouts, Books, Pictures)
- 💬 Real-time Messaging
- 👥 Friend Requests and Connections
- 🔍 Search Functionality
- 🔔 Notifications System
- 👤 User Profiles

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- Socket.IO (Real-time messaging)
- JWT Authentication
- Multer (File uploads)

### Frontend
- React
- React Router
- Socket.IO Client
- Tailwind CSS
- React Icons

## Prerequisites

Before running the project, make sure you have installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (or MongoDB Atlas account)
- npm or yarn package manager

## Installation & Setup

### 1. Clone the Repository

```bash
cd "C:\Users\ngpc0002u2\Desktop\Christech Analytics\Sturum"
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create a .env file in the backend directory
# Copy the .env.example and fill in your values
copy .env.example .env
```

Edit the `.env` file with your configuration:

```env
MONGO_URI_COMPASS=your_mongodb_connection_string_here
PORT=4000
SECRET=your_jwt_secret_key_here
```

**Example MongoDB connection strings:**
- Local MongoDB: `mongodb://localhost:27017/sturum`
- MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/sturum`

**Generate a JWT Secret:**
```bash
# On Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Or use an online generator
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

## Running the Project

### Start Backend Server

```bash
# From the backend directory
cd backend

# Start the server
npm start

# Or for development with auto-reload:
npm run dev
```

The backend server will run on `http://localhost:4000`

### Start Frontend Application

Open a **new terminal window** and run:

```bash
# From the frontend directory
cd frontend

# Start the React app
npm start
```

The frontend will automatically open in your browser at `http://localhost:3000`

## Project Structure

```
Sturum/
├── backend/
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Authentication middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── uploads/         # Uploaded files (created automatically)
│   ├── server.js        # Main server file
│   └── .env            # Environment variables
│
└── frontend/
    └── src/
        ├── components/  # Reusable components
        ├── context/     # React context
        ├── hooks/       # Custom hooks
        ├── pages/       # Page components
        └── App.js       # Main app component
```

## API Endpoints

### Departments
- `GET /api/departments?q=search` - Search departments by name or faculty
- `GET /api/departments/all` - Full department list (signup picker)

### Authentication
- `POST /api/users/signup` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/me` - Get current user

### Posts
- `GET /api/posts` - Get all posts (department filtered)
- `POST /api/posts` - Create a new post
- `POST /api/posts/:postId/like` - Like/Unlike a post
- `POST /api/posts/:postId/comments` - Add a comment

### Materials
- `GET /api/materials` - Get materials (department filtered)
- `POST /api/materials` - Upload a material
- `DELETE /api/materials/:id` - Delete own material

### Files
- `GET /api/files/:filename` - Authenticated file access (Bearer or `?token=`)

### Auth
- `POST /api/auth/refresh` - Refresh access token

### Messaging
- `GET /api/messages/:chatId` - Get messages for a chat
- `POST /api/messages` - Send a message

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/me` - Update current user profile
- `GET /api/users/connections` - Get user connections
- `POST /api/users/friend-request/:id` - Send friend request
- `POST /api/users/accept-friend-request/:id` - Accept friend request
- `POST /api/users/decline-friend-request/:id` - Decline friend request

### Search
- `GET /api/search?query=searchterm` - Search posts, materials, and users

## Departments

Students choose their department during signup using a **searchable picker** (filter by name or faculty).

- **API:** `GET /api/departments?q=computer` — search departments (public)
- **API:** `GET /api/departments/all` — full list with categories (public)
- **Source of truth:** `backend/constants/departments.js` (80+ departments across marine, engineering, sciences, business, health, law, arts, agriculture, education, and more)

To add or edit departments, update `backend/constants/departments.js` and redeploy the backend.

## Troubleshooting

### Backend Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running (if using local MongoDB)
   - Check your connection string in `.env`
   - Verify network access if using MongoDB Atlas

2. **Port Already in Use**
   - Change the PORT in `.env` file
   - Or stop the process using port 4000

3. **Module Not Found**
   - Run `npm install` again in the backend directory
   - Delete `node_modules` and `package-lock.json`, then reinstall

### Frontend Issues

1. **Cannot Connect to Backend**
   - Ensure backend server is running on port 4000
   - Check CORS settings if accessing from different origin

2. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check React version compatibility

## Development Notes

- The `uploads` directory is created automatically when the server starts
- File uploads are stored in `backend/uploads/` and served only via authenticated `/api/files/:filename`
- Access tokens expire after 3 days; refresh tokens after 7 days (`POST /api/auth/refresh`)
- Socket.IO requires JWT auth and delivers events to user-specific rooms
- Study materials are scoped by department; run migration for existing data:

```bash
cd backend
node scripts/migrate-material-departments.js
```

## Production Checklist

- Set `NODE_ENV=production` on the backend
- Use strong `SECRET` and `REFRESH_SECRET` values
- Set `FRONTEND_URL` to your deployed frontend origin (no trailing slash)
- Run the materials migration script if upgrading an existing database
- Configure MongoDB Atlas network access and backups

## License

ISC
