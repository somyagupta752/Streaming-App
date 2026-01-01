# Video Sharing - Quick Reference

## 🚀 What's New

- Share videos with email addresses
- Two roles: Viewer (watch only) and Editor (future edit capability)
- Dedicated "Shared With Me" page
- Search, filter, and manage shares

## 📁 New Files Created

### Backend
- `backend/src/models/Share.js` - Share model
- `backend/src/controllers/shareController.js` - Share logic
- `backend/src/routes/shareRoutes.js` - API endpoints

### Frontend
- `my-app/src/components/ShareModal.tsx` - Share dialog UI
- `my-app/src/pages/SharedWithMe.tsx` - Shared videos page

### Documentation
- `SHARING_FEATURE_GUIDE.md` - Full feature documentation
- `SHARING_TEST_GUIDE.md` - Testing procedures
- `SHARING_ARCHITECTURE.md` - Technical architecture
- `SHARING_QUICK_START.md` - Getting started guide

## 🔄 Modified Files

| File | Changes |
|------|---------|
| `backend/src/models/Video.js` | Added `sharedWith` array field |
| `backend/src/controllers/videoController.js` | Updated authorization checks |
| `backend/src/server.js` | Imported share routes |
| `my-app/src/services/api.ts` | Added `shareAPI` methods |
| `my-app/src/pages/Library.tsx` | Added share button and modal |
| `my-app/src/components/Header.tsx` | Added "Shared" link |
| `my-app/src/components/index.ts` | Exported ShareModal |
| `my-app/src/App.tsx` | Added SharedWithMe route |

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/videos/:id/share` | Share a video |
| GET | `/api/videos/:id/shares` | Get all shares for a video |
| PUT | `/api/shares/:shareId` | Update share role |
| DELETE | `/api/shares/:shareId` | Remove a share |
| GET | `/api/shared` | Get videos shared with user |

## 🎯 Usage Flows

### Share a Video
```
Library → Find Video → Click Share → Enter Email → Select Role → Confirm
```

### View Shared Videos
```
Header "Shared" → See Videos → Filter/Search → Play → Manage Shares
```

### Manage Shares
```
Library → Share Button → Manage Tab → Update Role or Remove
```

## 🛡️ Authorization

| Action | Owner | Viewer | Editor |
|--------|-------|--------|--------|
| View Video | ✅ | ✅ | ✅ |
| Play Video | ✅ | ✅ | ✅ |
| Share Video | ✅ | ❌ | ❌ |
| Delete Video | ✅ | ❌ | ❌ |
| Edit Video | ✅ | ❌ | ⏳ |

## 📊 Database

### New Share Collection
```javascript
{
  videoId,         // Video being shared
  sharedBy,        // Video owner
  sharedWithEmail, // Recipient email
  sharedWithUser,  // Registered user (if any)
  role,            // 'viewer' or 'editor'
  sharedAt,        // When shared
  createdAt,       // Auto
  updatedAt        // Auto
}
```

### Video Model Update
```javascript
sharedWith: [
  {
    userId,
    email,
    role,
    shareId
  }
]
```

## ✅ Validation

- **Email**: Valid format required
- **Role**: Only 'viewer' or 'editor'
- **Self-share**: Prevented
- **Duplicates**: Not allowed
- **Ownership**: Only owner can share/unshare

## 🔍 Features

### For Video Owners
- ✅ Share with email addresses
- ✅ Select role (viewer/editor)
- ✅ View all shares
- ✅ Change permissions
- ✅ Remove shares

### For Shared Users
- ✅ View shared videos
- ✅ Play videos
- ✅ See who shared
- ✅ Filter by role
- ✅ Search videos
- ✅ Pagination

## 🧪 Quick Test

1. **Setup**: Create 2 accounts (alice@, bob@)
2. **Share**: Login as Alice, share video with bob@
3. **View**: Login as Bob, go to "Shared"
4. **Play**: Click play to verify access
5. **Manage**: Go back to Alice, modify role
6. **Verify**: Login as Bob again, verify change

## 📱 UI Components

### ShareModal
- **Location**: `my-app/src/components/ShareModal.tsx`
- **Props**: `isOpen, onClose, videoId, videoTitle, onShareSuccess`
- **Tabs**: Share | Manage
- **Features**: Email input, role selection, share list, role updater

### SharedWithMe Page
- **Location**: `my-app/src/pages/SharedWithMe.tsx`
- **Features**: Grid view, search, filter, pagination, play button
- **Shows**: Sharer info, role, shared date, video details

## 🔐 Security Features

✅ Email validation  
✅ Role validation  
✅ Authorization checks  
✅ Self-share prevention  
✅ Duplicate prevention  
✅ Owner-only operations  
✅ Token-based auth  

## 🚦 Status Codes

| Code | Meaning |
|------|---------|
| 201 | Share created |
| 200 | Success |
| 400 | Bad request (validation) |
| 401 | Not authenticated |
| 403 | Not authorized |
| 404 | Not found |
| 500 | Server error |

## 🔮 Future Ready

Already implemented but awaiting feature completion:
- `canDownload` - Download permission
- `canComment` - Comment permission
- `expiresAt` - Share expiration
- Infrastructure for public links
- Structure for notifications
- Ready for activity logging

## 📞 API Response Examples

### Share Video Success
```json
{
  "message": "Video shared successfully",
  "share": {
    "id": "507f1f77bcf86cd799439011",
    "videoId": "507f1f77bcf86cd799439012",
    "email": "user@example.com",
    "role": "viewer",
    "sharedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Get Shared Videos
```json
{
  "videos": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "My Video",
      "sharedBy": "John Doe",
      "sharedByEmail": "john@example.com",
      "sharedRole": "viewer",
      "sharedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 25,
    "pages": 3
  }
}
```

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Share button not showing | Check if in Library and authenticated |
| Can't see shared videos | Verify user is logged in with correct email |
| Role update not working | Check if you're the video owner |
| Video won't play | Verify you have access and backend is running |
| Share fails with email error | Verify email format is valid |

## 📖 Documentation Files

- **SHARING_FEATURE_GUIDE.md** - Complete feature documentation
- **SHARING_QUICK_START.md** - Getting started guide
- **SHARING_TEST_GUIDE.md** - Testing procedures & test cases
- **SHARING_ARCHITECTURE.md** - Technical architecture details
- **SHARING_QUICK_REFERENCE.md** - This file

## 🎓 Learning Path

1. Read: `SHARING_QUICK_START.md`
2. Understand: `SHARING_ARCHITECTURE.md`
3. Build: Follow `SHARING_FEATURE_GUIDE.md`
4. Test: Run through `SHARING_TEST_GUIDE.md`
5. Deploy: Use deployment checklist

## 🆘 Support

Check these files for answers:
- **How to use?** → SHARING_QUICK_START.md
- **How it works?** → SHARING_ARCHITECTURE.md
- **How to test?** → SHARING_TEST_GUIDE.md
- **Implementation details?** → SHARING_FEATURE_GUIDE.md
- **Quick lookup?** → This file

---

**Status**: ✅ Complete and Ready for Testing  
**Last Updated**: January 2026  
**Version**: 1.0
