# Video Sharing Feature - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/TypeScript)             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Components:                    Pages:                     │
│  - ShareModal.tsx               - Library.tsx              │
│  - Header.tsx                   - SharedWithMe.tsx         │
│                                                             │
│  Services:                      Routes:                    │
│  - api.ts (shareAPI)            - /library (Library)       │
│                                 - /shared-with-me (Shared) │
│                                                             │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   Backend (Node.js/Express)                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Routes:                    Controllers:                   │
│  - shareRoutes.js           - shareController.js           │
│    - POST /videos/:id/share   - shareVideo()              │
│    - GET /videos/:id/shares   - getVideoShares()          │
│    - PUT /shares/:shareId      - updateShare()            │
│    - DELETE /shares/:shareId   - unshareVideo()           │
│    - GET /shared               - getSharedVideos()        │
│                                                             │
│  Modified Routes:           Modified Controllers:          │
│  - videoRoutes.js           - videoController.js           │
│                               - getVideoDetails() [updated]│
│                               - streamVideo() [updated]    │
│                                                             │
│  Middleware:                                               │
│  - auth.js (authenticateToken)                             │
│                                                             │
└────────────────────┬────────────────────────────────────────┘
                     │ MongoDB
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   Database (MongoDB)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Collections:                                              │
│  - videos (modified schema)                                │
│    - sharedWith: Array                                     │
│  - shares (new collection)                                 │
│    - videoId, sharedBy, sharedWithEmail, role, etc.       │
│  - users                                                   │
│  - jobs                                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Sharing a Video

```
User (Owner)
    │
    ├─ Opens Library
    │
    ├─ Clicks Share button
    │
    ├─ ShareModal opens
    │
    ├─ Enters email & selects role
    │
    └─► POST /api/videos/:id/share
            │
            ├─ Backend validates email
            │
            ├─ Checks authorization (owner?)
            │
            ├─ Creates Share document
            │
            ├─ Updates Video.sharedWith array
            │
            └─► Returns success
                    │
                    └─ Frontend shows confirmation
```

### Viewing Shared Videos

```
User (Recipient)
    │
    ├─ Clicks "Shared" in navigation
    │
    └─► GET /api/shared
            │
            ├─ Backend queries shares by email
            │
            ├─ Finds associated videos
            │
            ├─ Populates with owner info
            │
            └─► Returns videos with metadata
                    │
                    └─ Frontend displays in SharedWithMe page
```

### Accessing Shared Video

```
User (Recipient)
    │
    ├─ Clicks "Play"
    │
    └─► GET /api/videos/:id/stream
            │
            ├─ Backend checks authorization
            │    │
            │    ├─ Is owner? → Allow
            │    │
            │    └─ In sharedWith? → Allow
            │
            └─► Streams video file
                    │
                    └─ Frontend plays in player
```

## Database Schema

### Share Collection
```javascript
{
  _id: ObjectId,
  videoId: ObjectId,              // ref: Video
  sharedBy: ObjectId,             // ref: User (video owner)
  sharedWithEmail: String,        // lowercase email
  sharedWithUser: ObjectId,       // ref: User (can be null)
  role: String,                   // "viewer" | "editor"
  canDownload: Boolean,           // false (future use)
  canComment: Boolean,            // false (future use)
  sharedAt: Date,                 // creation timestamp
  expiresAt: Date,                // null (future use)
  createdAt: Date,                // auto
  updatedAt: Date                 // auto
}
```

Indexes:
- `videoId: 1` - Query shares for a video
- `sharedWithEmail: 1` - Query shares by recipient email
- `sharedWithUser: 1` - Query shares for registered user

### Video Collection (Modified)
```javascript
{
  // ... existing fields ...
  sharedWith: [
    {
      userId: ObjectId,           // User who received share
      email: String,              // Email it was shared to
      role: String,               // "viewer" | "editor"
      shareId: ObjectId           // ref: Share document
    }
  ]
}
```

### User Collection (Unchanged)
```javascript
{
  _id: ObjectId,
  email: String,                  // lowercase, unique
  fullName: String,
  role: String,                   // "viewer" | "editor" | "admin"
  // ... other fields ...
}
```

## Authorization Model

### Video Access Rules

| Action | Owner | Viewer | Editor | Notes |
|--------|-------|--------|--------|-------|
| View Details | ✅ | ✅ | ✅ | If shared with those roles |
| Stream | ✅ | ✅ | ✅ | If shared with those roles |
| Delete | ✅ | ❌ | ❌ | Only owner |
| Share | ✅ | ❌ | ❌ | Only owner |
| Unshare | ✅ | ❌ | ❌ | Only owner |
| Modify Share | ✅ | ❌ | ❌ | Only owner |

### Share Management Rules

| Action | Owner | Shared User | Notes |
|--------|-------|-------------|-------|
| Create Share | ✅ | ❌ | POST /videos/:id/share |
| View Shares | ✅ | ❌ | GET /videos/:id/shares |
| Update Role | ✅ | ❌ | PUT /shares/:shareId |
| Delete Share | ✅ | ❌ | DELETE /shares/:shareId |
| View Own Shares | ❌ | ✅ | Via GET /shared |

## API Specification

### 1. Share Video
```
POST /api/videos/:id/share
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "role": "viewer" | "editor"
}

Response (201 Created):
{
  "message": "Video shared successfully",
  "share": {
    "id": "share_id",
    "videoId": "video_id",
    "email": "user@example.com",
    "role": "viewer",
    "sharedAt": "2024-01-01T00:00:00Z"
  }
}

Error Cases:
- 400: Email required, invalid email, self-share, duplicate share
- 401: Unauthorized (not logged in)
- 403: Forbidden (not video owner)
- 404: Video not found
- 500: Server error
```

### 2. Get Video Shares
```
GET /api/videos/:id/shares
Authorization: Bearer <token>

Response (200 OK):
{
  "message": "Shares retrieved successfully",
  "shares": [
    {
      "id": "share_id",
      "email": "user@example.com",
      "role": "viewer",
      "userName": "User Name",
      "sharedAt": "2024-01-01T00:00:00Z"
    }
  ]
}

Error Cases:
- 401: Unauthorized
- 403: Forbidden (not video owner)
- 404: Video not found
- 500: Server error
```

### 3. Update Share Role
```
PUT /api/shares/:shareId
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "role": "viewer" | "editor"
}

Response (200 OK):
{
  "message": "Share updated successfully",
  "share": {
    "id": "share_id",
    "role": "editor"
  }
}

Error Cases:
- 400: Invalid role
- 401: Unauthorized
- 403: Forbidden (not share creator)
- 404: Share not found
- 500: Server error
```

### 4. Remove Share
```
DELETE /api/shares/:shareId
Authorization: Bearer <token>

Response (200 OK):
{
  "message": "Video unshared successfully"
}

Error Cases:
- 401: Unauthorized
- 403: Forbidden (not share creator)
- 404: Share not found
- 500: Server error
```

### 5. Get Shared Videos
```
GET /api/shared?page=1&limit=12
Authorization: Bearer <token>

Response (200 OK):
{
  "message": "Shared videos retrieved successfully",
  "videos": [
    {
      "_id": "video_id",
      "title": "Video Title",
      "description": "...",
      "status": "completed",
      "sharedBy": "Owner Name",
      "sharedByEmail": "owner@example.com",
      "sharedRole": "viewer",
      "sharedAt": "2024-01-01T00:00:00Z",
      // ... other video fields
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 25,
    "pages": 3
  }
}

Error Cases:
- 401: Unauthorized
- 500: Server error
```

## State Management

### Frontend (React State)

**Library.tsx:**
- `shareModal: { isOpen, videoId, videoTitle }` - Modal state
- Videos, filters, pagination (existing)

**ShareModal.tsx:**
- `email: string` - Email input
- `role: 'viewer' | 'editor'` - Role selection
- `shares: Share[]` - List of current shares
- `activeTab: 'share' | 'manage'` - Modal tab
- `loading, error, success` - UI states

**SharedWithMe.tsx:**
- `videos: SharedVideo[]` - Shared videos
- `roleFilter: string` - Role filter
- `search: string` - Search query
- `loading, pagination` - UI states

### Backend (Request Context)

**req.user:**
```javascript
{
  _id: ObjectId,
  email: string,
  role: string,
  // ... other fields
}
```

**req.body (for shares):**
```javascript
{
  email: string,
  role: string
}
```

## Error Handling

### Frontend
- Toast/modal notifications for errors
- Validation before API calls
- User-friendly error messages
- Automatic retry for network errors

### Backend
- Input validation (email format, role enum)
- Authorization checks
- Database error handling
- Consistent error response format

## Security Considerations

1. **Email Validation**
   - Regex pattern: `/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/`
   - Prevents injection attacks

2. **Authorization**
   - Multiple layers: route, controller, model
   - User ID comparison for ownership

3. **Role Validation**
   - Enum: only 'viewer' or 'editor'
   - No privilege escalation possible

4. **Data Isolation**
   - Users can only see their own shares
   - Can only manage shares they created

5. **Token-based Auth**
   - JWT from Auth middleware
   - Expires and requires login

## Performance Optimizations

1. **Database Indexes**
   - videoId, sharedWithEmail, sharedWithUser
   - Enable fast queries

2. **Denormalization**
   - sharedWith array on Video
   - Reduces joins for access checks

3. **Pagination**
   - Both Library and Shared endpoints
   - Limits response size

4. **Efficient Queries**
   - Select specific fields
   - Populate related data only when needed

## Future Enhancement Points

1. **Expiration**
   - expiresAt field ready
   - Cleanup jobs for expired shares

2. **Permissions**
   - canDownload, canComment fields exist
   - Easy to extend with more granular controls

3. **Activity Logging**
   - Timestamps present
   - Easy to add audit trail

4. **Notifications**
   - Email field available
   - Can send notifications on share

5. **Public Sharing**
   - Add publicShare collection
   - Share links without email

## Deployment Checklist

- [ ] Share model migrated to production
- [ ] Video model migrated to production
- [ ] Share routes deployed
- [ ] Frontend components deployed
- [ ] Environment variables configured
- [ ] Database indexes created
- [ ] Tests passing
- [ ] Error monitoring set up
- [ ] Performance monitoring set up
- [ ] Backup strategy in place
