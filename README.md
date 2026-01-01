# VideoVault

A video management platform where you can upload, organize, and share your videos with built-in content analysis and real-time processing tracking.

## What is VideoVault?

VideoVault helps you manage your video library with ease. Upload videos, watch them process in real-time, and share them with others. The system automatically analyzes your content and gives you insights into what you've uploaded. Think of it as your personal video archive with smart features built in.

## Installation and Setup

Getting VideoVault up and running is pretty straightforward. You'll need Node.js (version 16 or higher) and MongoDB. Let's walk through it step by step.

### Prerequisites

First things first - make sure you have Node.js installed. Check by running:
```bash
node --version
```

If it's 16 or higher, you're good. If not, grab it from [nodejs.org](https://nodejs.org/).

### Setting up MongoDB

You'll need MongoDB to store your data. You have three options:

**Option 1: MongoDB Atlas (Easiest, especially for getting started)**
1. Head over to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account (the free tier is perfect for development)
3. Create a new cluster (choose the free M0 option)
4. Once it's set up, click "Connect" and get your connection string
5. It'll look something like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/videovault?retryWrites=true&w=majority`
6. Copy that string - you'll need it in a minute

**Option 2: Local MongoDB Installation**
If you prefer running MongoDB on your machine:
1. Download MongoDB Community Edition from [mongodb.com/download](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. Make sure the MongoDB service is running (it usually starts automatically)
4. Your connection string will be: `mongodb://localhost:27017/videovault`

**Option 3: Docker (If you're already using Docker)**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```
This gives you the same connection string as Option 2.

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install the dependencies:
```bash
npm install
```

3. Create a `.env` file in the `backend` directory with the following:
```env
PORT=5000
MONGODB_URI=your_connection_string_here
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

Replace `your_connection_string_here` with the MongoDB connection string you got earlier. For `JWT_SECRET`, just pick a random string - it's used to sign authentication tokens. Something like `mySecretKey123!@#` works fine for development.

4. Start the backend server:
```bash
npm start
```

You should see a message like "Server running on http://localhost:5000" and "MongoDB connected". If you see an error about MongoDB connection, double-check your connection string in the `.env` file.

### Frontend Setup

Open a new terminal window (keep the backend running) and:

1. Navigate to the frontend directory:
```bash
cd my-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173` (or the next available port if that's taken). You should see it open in your browser automatically.

### Quick Verification

Once both servers are running, you should be able to:
- See the landing page at `http://localhost:5173`
- Register a new account
- Log in and see the dashboard

If everything works, you're all set! If you run into issues, check the troubleshooting section at the bottom.

## User Manual

### Creating an Account

When you first visit VideoVault, you'll land on the homepage. Click "Get Started" or head to the registration page. You'll need:
- Your full name
- An email address
- A password (make it something secure)

Once you register, you'll automatically be logged in and taken to your dashboard.

### Uploading Videos

1. Click the "Upload Video" button (you'll find it on the dashboard or in the navigation)
2. Either drag and drop a video file or click to browse your files
3. Give your video a title (this is required)
4. Optionally add a description or tags
5. Click upload

You'll see the upload progress bar fill up. Once the file finishes uploading, it goes into processing. The progress bar will show you how far along the processing is - it polls every 2 seconds to keep you updated. When it hits 100%, your video is ready to view.

**Note:** The system accepts most common video formats, but if you upload something other than MP4, it'll automatically convert it to MP4 for better browser compatibility.

### Managing Your Videos

**Dashboard**
Your dashboard gives you a quick overview:
- Total number of videos you've uploaded
- How many are currently processing
- How many have been flagged (if any)
- Total storage space you're using

You'll also see your three most recent videos with their processing status.

**Library**
The Library page shows all your videos in a grid. You can:
- Filter by status (All, Completed, Processing, Flagged)
- Search videos by title
- See file sizes and upload dates
- Delete videos you no longer want
- Share videos with others (see Sharing section)

Click on a video to see more details or stream it.

### Viewing Videos

To watch a video, click the play button next to it. This opens the video in a new window where you can stream it directly. The video player supports standard controls like play, pause, and seeking.

### Sharing Videos

VideoVault lets you share videos with others and control what they can do.

1. Go to your Library page
2. Find the video you want to share
3. Click the "Share" button
4. Enter the email address of the person you want to share with
5. Choose their role:
   - **Viewer**: They can only watch the video
   - **Editor**: They can watch and edit the video's title and description
6. Click "Share"

The person you shared with will be able to see the video in their "Shared With Me" section once they log in (they'll need to create an account with the email address you used).

**Managing Shares**
You can see who has access to your videos and change their permissions or remove access entirely. Just click "Share" on a video again to see the list of people it's shared with.

### Content Analysis

When you upload a video, VideoVault automatically:
- Extracts metadata (duration, file size, format)
- Analyzes frames for content classification
- Classifies the content as safe, warning, or flagged
- Processes everything in the background

If a video gets flagged, you'll see it marked in your library. The system uses heuristics to analyze content - it's not perfect, but it gives you a good idea of what's in your videos.

### Profile

You can view and update your profile information from the Profile page in the navigation menu. Here you'll see your account details and statistics about your video library.

## API Documentation

The backend exposes a REST API that the frontend uses. Here's what's available if you want to integrate with it directly or build your own client.

### Base URL

All API endpoints are prefixed with `/api`. So if your backend is running on `http://localhost:5000`, the full base URL is `http://localhost:5000/api`.

### Authentication

Most endpoints require authentication. You'll need to include a JWT token in the Authorization header:

```
Authorization: Bearer <your_token_here>
```

When you register or log in, you'll receive a token in the response. Store it and include it with subsequent requests.

### Endpoints

#### Authentication

**POST `/api/auth/register`**
Register a new user account.

Request body:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "email": "john@example.com",
    "fullName": "John Doe"
  }
}
```

**POST `/api/auth/login`**
Log in with existing credentials.

Request body:
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

Response: Same format as register endpoint.

**GET `/api/auth/profile`**
Get the current user's profile information.

Headers: Requires Authorization token.

Response:
```json
{
  "user": {
    "_id": "...",
    "email": "john@example.com",
    "fullName": "John Doe",
    "totalVideos": 5,
    "totalStorage": 123456789
  }
}
```

#### Videos

**POST `/api/videos/upload`**
Upload a new video file.

Headers: Requires Authorization token, Content-Type: multipart/form-data

Request body (FormData):
- `video`: The video file
- `title`: Video title (required)
- `description`: Optional description
- `tags`: Optional comma-separated tags

Response:
```json
{
  "message": "Video uploaded successfully",
  "video": {
    "id": "...",
    "title": "My Video",
    "status": "processing",
    "fileSize": 12345678
  },
  "jobId": "uuid-string-here"
}
```

**GET `/api/videos`**
Get a list of videos for the authenticated user.

Headers: Requires Authorization token

Query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (optional: "completed", "processing", "flagged")

Response:
```json
{
  "message": "Videos retrieved successfully",
  "videos": [
    {
      "_id": "...",
      "title": "My Video",
      "status": "completed",
      "fileSize": 12345678,
      "uploadedAt": "2024-01-15T10:30:00.000Z",
      "jobId": "uuid-for-processing-videos"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

**GET `/api/videos/:id`**
Get details for a specific video.

Headers: Requires Authorization token

Response:
```json
{
  "message": "Video details retrieved successfully",
  "video": {
    "id": "...",
    "title": "My Video",
    "description": "Video description",
    "status": "completed",
    "sensitivity": {
      "classification": "safe",
      "score": 0,
      "reasons": []
    },
    "fileSize": 12345678,
    "duration": "5:30",
    "views": 3
  },
  "isOwner": true,
  "job": {
    "jobId": "...",
    "progress": 100,
    "status": "completed",
    "stage": "completed"
  }
}
```

**GET `/api/videos/:id/stream`**
Stream a video file. Supports HTTP range requests for seeking.

Headers: Optional Authorization token (required if video is private/shared)

Response: Video file stream with appropriate content-type headers.

**DELETE `/api/videos/:id`**
Delete a video. Only the owner can delete videos.

Headers: Requires Authorization token

Response:
```json
{
  "message": "Video deleted successfully"
}
```

**PATCH `/api/videos/:id`**
Update video metadata (title and/or description). Owners and editors can update.

Headers: Requires Authorization token

Request body:
```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

Response:
```json
{
  "message": "Video updated successfully",
  "video": {
    "id": "...",
    "title": "Updated Title",
    "description": "Updated description"
  }
}
```

**GET `/api/videos/job/:jobId/progress`**
Get the current processing progress for a video.

Headers: Requires Authorization token

Response:
```json
{
  "message": "Job progress retrieved successfully",
  "job": {
    "jobId": "...",
    "progress": 75,
    "status": "processing",
    "stage": "analyzing_content"
  }
}
```

#### Sharing

**POST `/api/videos/:id/share`**
Share a video with another user by email.

Headers: Requires Authorization token

Request body:
```json
{
  "email": "recipient@example.com",
  "role": "viewer"
}
```

Valid roles: "viewer" or "editor"

Response:
```json
{
  "message": "Video shared successfully",
  "share": {
    "_id": "...",
    "videoId": "...",
    "sharedWithEmail": "recipient@example.com",
    "role": "viewer"
  }
}
```

**GET `/api/videos/:id/shares`**
Get list of people a video is shared with.

Headers: Requires Authorization token

Response:
```json
{
  "message": "Shares retrieved successfully",
  "shares": [
    {
      "_id": "...",
      "sharedWithEmail": "recipient@example.com",
      "role": "viewer",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**PUT `/api/shares/:shareId`**
Update the role for a share.

Headers: Requires Authorization token

Request body:
```json
{
  "role": "editor"
}
```

**DELETE `/api/shares/:shareId`**
Remove access for a shared user.

Headers: Requires Authorization token

**GET `/api/shared`**
Get all videos shared with the current user.

Headers: Requires Authorization token

Query parameters: Same pagination options as `/api/videos`

Response: Same format as `/api/videos`

### Error Responses

All endpoints follow a consistent error format:

```json
{
  "message": "Error description here"
}
```

Common HTTP status codes:
- `400`: Bad request (validation errors, missing fields)
- `401`: Unauthorized (invalid or missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not found (resource doesn't exist)
- `500`: Internal server error

## Architecture Overview

VideoVault follows a pretty standard three-tier architecture: frontend, backend, and database. Here's how it all fits together.

### The Big Picture

```
┌─────────────────────────────────────────┐
│         React Frontend (Browser)        │
│  - TypeScript for type safety           │
│  - Tailwind CSS for styling             │
│  - React Router for navigation          │
│  - Axios for API calls                  │
└──────────────────┬──────────────────────┘
                   │
                   │ HTTP/REST + JWT
                   │
┌──────────────────▼──────────────────────┐
│      Express Backend (Node.js)          │
│  - RESTful API endpoints                │
│  - JWT authentication middleware        │
│  - File upload handling (Multer)        │
│  - Background processing jobs           │
│  - Video streaming with range support   │
└──────────────────┬──────────────────────┘
                   │
                   │ Mongoose ODM
                   │
┌──────────────────▼──────────────────────┐
│         MongoDB Database                │
│  - users: Account information           │
│  - videos: Video metadata               │
│  - processingjobs: Job tracking         │
│  - shares: Sharing relationships        │
└─────────────────────────────────────────┘
```

### Frontend Architecture

The frontend is built with React and TypeScript. We use:
- **Vite** as the build tool (it's fast)
- **React Router** for client-side routing
- **Axios** for API communication with interceptors to handle auth tokens
- **Tailwind CSS** for styling (utility-first approach)
- **Framer Motion** for smooth animations

The app structure is pretty straightforward:
- `pages/` contains the main page components (Dashboard, Library, Upload, etc.)
- `components/` has reusable UI components
- `services/api.ts` handles all API communication
- `App.tsx` sets up routes and handles authentication state

We use React hooks for state management. No Redux or complex state libraries - just useState and useEffect where needed. This keeps things simple and the code easy to follow.

### Backend Architecture

The backend is an Express.js application organized in a typical MVC-like structure:
- **Routes** define the endpoints and wire them to controllers
- **Controllers** handle the business logic
- **Models** define the database schemas using Mongoose
- **Middleware** handles cross-cutting concerns like authentication

The server handles:
- Authentication (JWT-based)
- File uploads (using Multer)
- Video processing (background jobs)
- Video streaming (with HTTP range request support for seeking)
- Sharing logic

Processing happens asynchronously. When you upload a video, it gets saved immediately and a processing job is created. The actual processing (frame extraction, analysis, etc.) happens in the background, and the frontend polls for progress updates.

### Database Schema

We use MongoDB because it's flexible and works well for this type of application. The main collections are:

**users**
- Stores account information
- Passwords are hashed using bcrypt
- Tracks statistics (total videos, storage used)

**videos**
- Stores video metadata (title, description, file info)
- Tracks processing status
- Stores sensitivity analysis results
- Maintains sharing relationships

**processingjobs**
- Tracks background processing jobs
- Stores progress (0-100%)
- Records processing stages
- Links to videos via videoId

**shares**
- Manages video sharing relationships
- Links videos to recipients via email
- Stores role permissions (viewer/editor)

We've added indexes on frequently queried fields (userId, status, uploadedAt) to keep queries fast even as the database grows.

### Data Flow Examples

**Upload Flow:**
1. User selects file in the browser
2. Frontend creates FormData and sends POST request to `/api/videos/upload`
3. Backend authenticates the request using JWT
4. Multer saves the file to disk
5. Video document is created in MongoDB with status "processing"
6. Processing job is created
7. Background processing starts (transcoding, frame extraction, analysis)
8. Frontend receives response with video ID and job ID
9. Frontend polls `/api/videos/job/:jobId/progress` every 2 seconds
10. When processing completes, video status updates to "completed" or "flagged"

**Viewing Flow:**
1. User clicks to view a video
2. Frontend requests `/api/videos/:id/stream`
3. Backend checks authorization (owner or shared user)
4. Backend streams the video file with range request support
5. Browser can seek through the video using HTTP range requests

**Sharing Flow:**
1. Owner clicks share button on a video
2. Frontend sends POST to `/api/videos/:id/share` with email and role
3. Backend validates the email and creates a Share document
4. Video's sharedWith array is updated
5. When the recipient logs in, they can see the video in their "Shared With Me" section
6. The recipient's access is checked when they try to view or edit the video

## Assumptions and Design Decisions

Every project makes certain assumptions and trade-offs. Here's the thinking behind some of VideoVault's design choices.

### Technology Choices

**Why React + TypeScript?**
React is widely used, has great tooling, and makes building interactive UIs straightforward. TypeScript adds type safety which catches bugs before they make it to production. The learning curve is reasonable, and there's plenty of community support.

**Why Express.js?**
Express is the most popular Node.js framework. It's lightweight, flexible, and has a huge ecosystem of middleware. For a REST API, it's perfect - not too much magic, easy to understand, and performant enough for our needs.

**Why MongoDB?**
MongoDB's flexible schema works well for video metadata where fields might vary. The document model maps nicely to JavaScript objects, reducing the impedance mismatch. For this scale, it's more than sufficient, and it's easy to get started with.

**Why JWT for authentication?**
JWTs are stateless, which makes them easy to use in a distributed system. They're self-contained (no need to hit the database on every request to check if a session is valid). The 7-day expiry is a balance between security and user convenience - users don't have to log in constantly, but tokens do expire eventually.

### Processing Architecture

**Why polling instead of WebSockets for progress?**
We have Socket.io set up, but for progress updates, we went with polling. It's simpler to implement, more reliable (no connection drops to worry about), and for this use case (checking every 2 seconds), the overhead is minimal. WebSockets would be overkill here, though we left the infrastructure in place if we want to switch later.

**Why process videos in the background?**
Video processing can take time - extracting frames, analyzing content, transcoding formats. If we did this synchronously, users would be waiting for the upload request to complete, which could timeout or feel unresponsive. Background processing lets us return immediately and update progress as we go.

**Why simulate some processing steps?**
The actual video analysis (frame extraction, content classification) is implemented, but some steps use simulated delays. This is because real video processing can be slow, and during development/testing, you want feedback quickly. The architecture supports real processing - you just swap out the simulation with actual work.

### File Storage

**Why store files on disk instead of cloud storage?**
For development and small deployments, local disk storage is simpler. No need to set up S3 or similar services, no extra API calls, no additional costs. The code structure makes it easy to swap in cloud storage later if needed - you'd just change where Multer saves files and how streaming works.

**Why convert everything to MP4?**
Browser video support can be inconsistent. MP4 with H.264 is universally supported. Converting on upload ensures videos will play everywhere, even if the user uploads MOV, AVI, or other formats.

### Sharing Model

**Why email-based sharing instead of user IDs?**
Email is more intuitive - users don't need to know usernames or user IDs. When you share, you just enter an email address. The recipient creates an account with that email, and the system links them up. It's simpler from a user experience perspective.

**Why role-based permissions?**
Viewer and Editor roles cover the main use cases without overcomplicating things. Viewers can watch, editors can watch and modify metadata. We could add more granular permissions later, but this covers 90% of scenarios.

**Why store sharing in both the Video document and a separate Share collection?**
The Video.sharedWith array makes it fast to check if a user has access to a video. The Share collection makes it easy to query "what videos are shared with me" without scanning all videos. It's a bit of denormalization for performance - a common pattern in NoSQL databases.

### Security Considerations

**Why bcrypt with 10 rounds?**
10 rounds is the sweet spot - secure enough without being too slow. Each login takes a fraction of a second, which is acceptable. Going higher would improve security marginally but hurt user experience.

**Why store JWT tokens in localStorage?**
localStorage is convenient for SPAs and fine for this use case. If we were handling highly sensitive data, we might use httpOnly cookies to prevent XSS attacks from stealing tokens. For a video management platform, localStorage strikes the right balance.

**Why CORS restrictions?**
We only allow requests from the frontend origin. This prevents other websites from making requests to your API on behalf of users. It's a basic security measure that's easy to implement and prevents a whole class of attacks.

### User Experience Decisions

**Why show progress as a percentage?**
Progress bars give users feedback that something is happening. Percentage is more informative than just a spinner. We poll every 2 seconds - frequent enough to feel responsive, not so frequent that we hammer the server.

**Why separate Dashboard and Library?**
Dashboard is for quick overview - stats and recent videos. Library is for browsing your entire collection. This separation keeps the UI clean and gives users the right tool for the job.

**Why pagination instead of infinite scroll?**
Pagination is more predictable and performant. Infinite scroll can be annoying if you accidentally scroll past something. With pagination, you know where you are and can jump around easily.

### What We Chose Not to Do (Yet)

**Real-time collaboration:** The sharing system is there, but we don't have real-time editing. Editors see each other's changes on refresh, not live. Adding WebSocket-based live updates would be the next step.

**Advanced search:** Right now you can search by title. Adding full-text search, filtering by tags, date ranges, etc. would be valuable but adds complexity. The current search covers the common case.

**Video thumbnails:** We extract frames during processing, but we don't generate thumbnail images yet. The infrastructure is there - it's just a matter of saving and serving the thumbnail images.

**Email notifications:** When you share a video, the recipient has to discover it themselves. Sending an email notification would be better UX, but requires setting up an email service.

## Troubleshooting

**MongoDB connection errors:**
- Double-check your connection string in the `.env` file
- Make sure MongoDB is actually running (if local) or your cluster is active (if Atlas)
- Check that your IP is whitelisted in Atlas (if using cloud)
- Verify your username and password are correct

**Videos stuck in processing:**
- Check the backend console for error messages
- Make sure FFmpeg is installed if you're doing real transcoding
- Check that the `uploads` directory exists and is writable
- Look at the ProcessingJob documents in MongoDB to see what stage failed

**Can't log in after registering:**
- Make sure the JWT_SECRET in `.env` hasn't changed (changing it invalidates all tokens)
- Check MongoDB to see if the user was actually created
- Try registering again with a different email

**Frontend won't connect to backend:**
- Verify both servers are running
- Check that the backend is on port 5000
- Look for CORS errors in the browser console
- If you set VITE_API_URL, make sure it's correct

**Upload fails:**
- Check file size (limit is 2GB)
- Verify the file is actually a video format
- Make sure you have disk space
- Check backend logs for specific error messages

## Getting Help

If you run into issues that aren't covered here, check the backend and frontend console logs - they usually have helpful error messages. The code is structured to be readable, so diving into the source is often the fastest way to understand what's happening.

For development, make sure to check the browser's developer console and the Node.js server logs - most issues will show up there with enough detail to figure out what's wrong.
