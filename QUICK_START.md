# Quick Start & Testing Guide

## ⚡ Fast Setup (5 minutes)

### Prerequisites Check
- Node.js installed: `node --version` (should be 16+)
- MongoDB running: `mongosh` should connect
- Ports available: 5173 (frontend), 5000 (backend)

### Start Servers

**Terminal 1 - Backend:**
```powershell
cd "c:\Users\praty\OneDrive\Desktop\devtask\backend"
node src/server.js
```
Expected output:
```
✓ Server running on http://localhost:5000
✓ Frontend URL: http://localhost:5173
✓ Environment: development
```

**Terminal 2 - Frontend:**
```powershell
cd "c:\Users\praty\OneDrive\Desktop\devtask\my-app"
npm run dev
```
Expected output:
```
VITE v7.3.0  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Press h to show help
```

Open browser: **http://localhost:5173**

---

## 🧪 Testing Scenarios

### Test 1: Complete User Journey (10 minutes)

**Step 1: Register**
1. Click "Get Started" button on landing page
2. Fill form:
   - Full Name: `John Doe`
   - Email: `john@test.com`
   - Password: `Test123456`
   - Confirm Password: `Test123456`
3. Click "Create Account"
4. ✅ Should redirect to Dashboard (empty state)

**Step 2: Upload Video**
1. Click "Upload Video" button
2. Drag and drop a video file OR click to browse
3. Watch upload progress: 0% → 100%
4. Video enters "Processing" state (spinning loader)
5. After 2 seconds, status changes to "Completed"
6. ✅ File appears in `backend/uploads/` directory
7. Video appears in "Recent Videos" on dashboard

**Step 3: View Dashboard**
1. Dashboard stats should update:
   - Total Videos: `1`
   - Storage Used: `[calculated size]`
2. Recent Videos shows the uploaded video with:
   - Title (video filename)
   - Status badge: "✓ completed"
   - File size
   - Upload time

**Step 4: Browse Library**
1. Click "Library" link
2. See video in grid layout
3. Verify video details:
   - Thumbnail placeholder
   - Status badge
   - File size
   - Date

**Step 5: Logout & Login**
1. Click user menu → "Logout"
2. Should redirect to login page
3. Fill login form:
   - Email: `john@test.com`
   - Password: `Test123456`
4. Click "Sign In"
5. ✅ Should be back at dashboard with uploaded video

---

### Test 2: Error Handling (5 minutes)

**Test 2a: Validation Errors**
1. Go to Register page
2. Try to submit with blank fields
3. ✅ Should show error "All fields are required"
4. Enter password: `123` (too short)
5. Click Register
6. ✅ Should show error "Password must be at least 6 characters"

**Test 2b: Login Errors**
1. Go to Login page
2. Enter wrong credentials:
   - Email: `wrong@test.com`
   - Password: `wrongpass`
3. ✅ Should show backend error message

**Test 2c: File Validation**
1. Go to Upload page
2. Try to upload a non-video file (e.g., .txt)
3. ✅ Should show error "Only video files are allowed"

---

### Test 3: Multiple Videos (10 minutes)

**Upload 3 Different Videos:**
1. Upload first video (e.g., `video1.mp4`)
   - Wait for completion
2. Upload second video (e.g., `video2.mkv`)
   - Watch processing
3. Upload third video (e.g., `video3.webm`)
   - All three uploading/processing

**Verify Dashboard:**
- Total Videos: `3`
- Processing: `0` or `1` (depending on timing)
- Storage Used: `[sum of all sizes]`
- Recent Videos: Shows last 3 uploads

**Verify Library:**
1. Click Library
2. Should show 3 video cards
3. Filter by Status:
   - "All Videos" → Shows all 3
   - "Completed" → Shows completed ones
4. Search by title:
   - Type first video name
   - ✅ Shows only that video

---

### Test 4: Pagination (5 minutes)

**Create Many Videos:**
1. Upload 15+ videos (or use test script)
2. Go to Library page
3. Verify pagination:
   - Shows 12 videos per page (default)
   - "Page 1 of 2" indicator
   - Next button enabled
4. Click "Next" button
5. ✅ Shows remaining videos
6. Click "Previous" button
7. ✅ Returns to page 1

---

### Test 5: Filtering & Search (5 minutes)

**Setup:**
1. Upload 3+ videos

**Test Filters:**
1. Library page
2. Status dropdown → "Completed"
3. ✅ Shows only completed videos
4. Status dropdown → "Processing"
5. ✅ Shows only processing videos (may be empty if all done)
6. Status dropdown → "All Videos"
7. ✅ Shows all again

**Test Search:**
1. Upload videos with different names
2. In Library, search for partial name
3. ✅ Results filter in real-time
4. Clear search
5. ✅ Shows all videos again

---

### Test 6: Delete Operations (5 minutes)

**Delete Single Video:**
1. Go to Library
2. Hover over a video card
3. Click red trash icon
4. Confirm in alert: "Are you sure..."
5. Click "OK"
6. ✅ Video disappears from grid
7. Dashboard stats update (Total Videos decreases)
8. File removed from `backend/uploads/`

---

## 🔍 Database Verification

### Check MongoDB Data

```powershell
# Connect to MongoDB
mongosh

# Select database
use videovault

# View users
db.users.find({}, { password: 0 }).pretty()

# View videos
db.videos.find({}).pretty()

# Check file storage
dir backend\uploads\
```

Example output:
```
> db.users.find({})
[
  {
    _id: ObjectId("..."),
    fullName: "John Doe",
    email: "john@test.com",
    role: "viewer",
    totalVideos: 3,
    totalStorage: 1234567890,
    createdAt: ISODate("2024-01-20T..."),
    updatedAt: ISODate("2024-01-20T...")
  }
]

> db.videos.find({})
[
  {
    _id: ObjectId("..."),
    userId: ObjectId("..."),
    title: "video1.mp4",
    description: "...",
    filename: "unique-hash-video1.mp4",
    fileSize: 123456789,
    mimeType: "video/mp4",
    status: "completed",
    sensitivity: {
      classification: "safe",
      score: 12,
      reasons: []
    },
    createdAt: ISODate("2024-01-20T..."),
    updatedAt: ISODate("2024-01-20T...")
  }
]
```

---

## 🛠️ Debugging Tips

### Frontend Issues

**Blank page or infinite loading:**
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for 5xx errors
4. Ensure backend is running on port 5000

**"Cannot find module" errors:**
1. Ensure node_modules installed: `npm install`
2. Check import paths are correct
3. Restart dev server

**Styles not loading:**
1. Clear cache: `Ctrl+Shift+Delete` (browser)
2. Restart dev server
3. Check `npm run build` for CSS errors

### Backend Issues

**"Cannot connect to MongoDB":**
1. Check MongoDB running: `mongosh`
2. Verify connection string in `.env`
3. Check MongoDB port (default 27017)

**"Port 5000 already in use":**
1. Find process: `netstat -ano | findstr :5000`
2. Kill process: `taskkill /PID [pid] /F`
3. Or change PORT in `.env` and restart

**Uploads not saving:**
1. Check `backend/uploads/` directory exists
2. Verify file permissions
3. Check disk space available

### Database Issues

**Cannot authenticate:**
1. Verify .env has MongoDB_URI
2. No authentication needed for localhost
3. Check MongoDB service is running

**Data not persisting:**
1. Check MongoDB is actually running
2. Use `db.videovault.stats()` to verify database exists
3. Check write permissions to `/data/db`

---

## 📊 API Testing with Browser DevTools

### Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Register a new user
4. Expand POST request to `/auth/register`
5. Response should contain:
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIs...",
     "user": {
       "id": "...",
       "email": "test@example.com",
       "fullName": "Test User",
       "role": "viewer"
     }
   }
   ```

### Console Tab
```javascript
// Check stored token
localStorage.getItem('token')

// Check stored user
JSON.parse(localStorage.getItem('user'))

// Make API call manually
fetch('http://localhost:5000/api/videos', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
}).then(r => r.json()).then(d => console.log(d))
```

---

## 📝 Common Test Cases Checklist

- [ ] User can register with valid data
- [ ] User cannot register with invalid email
- [ ] User cannot register with mismatched passwords
- [ ] User can login after registration
- [ ] User cannot login with wrong password
- [ ] Dashboard displays correct stats
- [ ] Video upload shows real progress
- [ ] Video status updates after upload
- [ ] Library displays all videos
- [ ] Library filters work correctly
- [ ] Library search works correctly
- [ ] Video can be deleted
- [ ] Logout clears token and redirects
- [ ] Protected routes redirect to login when not authenticated
- [ ] Error messages display correctly
- [ ] Loading states show spinners
- [ ] Empty states show helpful messages

---

## 🚀 Performance Testing

### Simulate Slow Network
1. DevTools (F12) → Network tab
2. Throttling dropdown → "Slow 3G"
3. Perform actions and observe UI response
4. Loading spinners should appear
5. No blank screens or freezing

### Monitor Memory
1. DevTools → Performance tab
2. Record for 10 seconds during upload
3. Should not exceed 100MB increase
4. Memory should stabilize after actions complete

---

## 📞 Support

### If Something Breaks

**Frontend won't build:**
```bash
rm -r node_modules
npm install
npm run build
```

**Backend won't start:**
```bash
cd backend
rm -r node_modules
npm install
node src/server.js
```

**Need fresh database:**
```bash
mongosh videovault
db.dropDatabase()
# Restart server
```

---

Last Updated: 2024
Integration Status: ✅ **COMPLETE & TESTED**
