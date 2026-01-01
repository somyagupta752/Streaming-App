# Video Sharing Feature - Integration Testing Guide

## Pre-Testing Setup

### Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm start
# Should see: "Server is running on port 5000"

# Terminal 2 - Frontend
cd my-app
npm run dev
# Should see: "VITE v... ready in XXX ms"
```

### Create Test Accounts
1. Go to http://localhost:5173/register
2. Create Account A:
   - Name: Alice User
   - Email: alice@example.com
   - Password: test123456

3. Create Account B:
   - Name: Bob User
   - Email: bob@example.com
   - Password: test123456

4. Create Account C:
   - Name: Charlie User
   - Email: charlie@example.com
   - Password: test123456

## Test Cases

### Test 1: Upload Video (Prerequisite)
**As:** Account A
**Steps:**
1. Login with alice@example.com
2. Click "Upload New Video" button
3. Select a video file
4. Enter title: "Test Video A"
5. Enter description: "This is a test video"
6. Click Upload
7. Wait for processing to complete

**Expected Result:**
- Video appears in Library with "processing" status
- Status changes to "completed" after processing

---

### Test 2: Share Video with Valid Email
**As:** Account A
**Steps:**
1. Go to Library
2. Find "Test Video A"
3. Click Share button (chain icon)
4. Enter: bob@example.com
5. Select role: Viewer
6. Click "Share Video"

**Expected Result:**
- Green success message: "Video shared with bob@example.com as viewer"
- Modal closes
- Can see the share in "Manage" tab

---

### Test 3: View Shares
**As:** Account A
**Steps:**
1. Click Share button on "Test Video A" again
2. Click "Manage" tab

**Expected Result:**
- See Bob User listed
- Email shows: bob@example.com
- Role shows: Viewer
- Has options to change role or remove

---

### Test 4: Update Share Role
**As:** Account A
**Steps:**
1. In Manage tab, find Bob's share
2. Click "Editor" button next to the Viewer role

**Expected Result:**
- Role updates immediately
- Bob's share now shows "Editor"
- Success message appears

---

### Test 5: Share Error Cases
**As:** Account A
**Steps:**

Test 5a - Invalid Email:
1. Click Share button
2. Enter: "not-an-email"
3. Click Share Video

**Expected Result:**
- Error message: "Please enter a valid email address"

Test 5b - Share with Self:
1. Click Share button
2. Enter: alice@example.com
3. Click Share Video

**Expected Result:**
- Error message: "Cannot share video with yourself"

Test 5c - Duplicate Share:
1. Click Share button
2. Enter: bob@example.com (already shared)
3. Click Share Video

**Expected Result:**
- Error message: "Video already shared with this email"

---

### Test 6: View Shared Video (As Receiver)
**As:** Account B
**Steps:**
1. Logout from Alice's account
2. Login as bob@example.com
3. Click "Shared" in header navigation
4. Look for "Test Video A"

**Expected Result:**
- See "Test Video A" in the list
- Shows "Shared by: Alice User (alice@example.com)"
- Shows role: "Can Edit" (because we updated to Editor)
- Shows shared date
- Video details visible

---

### Test 7: Search Shared Videos
**As:** Account B
**Steps:**
1. In Shared page
2. Search for "alice"

**Expected Result:**
- "Test Video A" appears
- Results filtered by shared person name

Test with title search:
1. Search for "test"

**Expected Result:**
- "Test Video A" appears
- Results filtered by video title

---

### Test 8: Filter by Role
**As:** Account B
**Steps:**
1. In Shared page
2. Click filter dropdown
3. Select "Editor"

**Expected Result:**
- Only videos with Editor role show

Test with Viewer:
1. Filter dropdown
2. Select "Viewer"

**Expected Result:**
- Only videos with Viewer role show (if any)

---

### Test 9: Play Shared Video
**As:** Account B
**Steps:**
1. In Shared page, find "Test Video A"
2. Click "Play" button

**Expected Result:**
- Video player opens in new window
- Video plays without errors
- Streams successfully

---

### Test 10: Remove Share
**As:** Account A
**Steps:**
1. Login as alice@example.com
2. Go to Library
3. Click Share on "Test Video A"
4. Go to "Manage" tab
5. Find Bob's share
6. Click "Remove" button
7. Confirm the dialog

**Expected Result:**
- Share is removed
- Bob's entry disappears
- Success message appears

---

### Test 11: Shared Video Disappears After Unshare
**As:** Account B
**Steps:**
1. Refresh the Shared page (if still logged in)

**Expected Result:**
- "Test Video A" is gone
- Shared page is empty (if no other shares)

---

### Test 12: Share with Multiple Users
**As:** Account A
**Steps:**
1. Login as alice@example.com
2. Upload another video: "Test Video 2"
3. Share with bob@example.com as Viewer
4. Share with charlie@example.com as Editor
5. Click Manage tab

**Expected Result:**
- Two shares visible
- Bob has Viewer role
- Charlie has Editor role
- Both can be modified independently

---

### Test 13: Cross-User Access
**As:** Account C
**Steps:**
1. Login as charlie@example.com
2. Go to Library
3. Try to access Test Video 2 directly if you know the ID

**Expected Result:**
- Can view in Shared tab
- Can play the video
- Cannot delete or unshare (not owner)

---

### Test 14: Unregistered User Sharing
**As:** Account A
**Steps:**
1. Login as alice@example.com
2. Upload video: "Test Video 3"
3. Share with: unregistered@example.com as Viewer
4. Click Manage to verify

**Expected Result:**
- Share created successfully
- Shows "Unregistered" as user name
- Email shown as: unregistered@example.com

When that user registers:
1. New user registers with unregistered@example.com
2. Logs in
3. Goes to "Shared"

**Expected Result:**
- Video is now visible
- Can watch it
- Shows who shared it

---

### Test 15: Authorization Checks
**As:** Account B (non-owner)
**Steps:**
1. Login as bob@example.com
2. Try to access API directly:
   - Try to GET /api/videos/:id/shares (video owned by Alice)
   - Try to PUT /api/shares/:shareId with different role
   - Try to DELETE /api/shares/:shareId

**Expected Result:**
- All return 403 Forbidden errors
- Cannot modify shares they don't own

---

### Test 16: Pagination
**As:** Account A
**Steps:**
1. Share same video with 15+ different emails
2. Go to Library
3. Verify pagination shows pages

**Expected Result:**
- Multiple pages displayed
- Can navigate between pages
- Shows "Page X of Y"

---

### Test 17: Database Verification
**Step:**
1. Check MongoDB to verify data

**Expected Result:**
- Share collection has entries:
  - videoId: [video id]
  - sharedBy: [alice id]
  - sharedWithEmail: [recipient email]
  - role: [viewer/editor]
  - timestamps present

- Video document has sharedWith array:
  - Multiple entries for each share
  - Each with email, role, and shareId

---

## Performance Tests

### Test P1: Sharing Speed
**Steps:**
1. Share video with 10 different emails
2. Time how long it takes

**Expected Result:**
- Each share completes in < 1 second
- UI remains responsive

### Test P2: Loading Shared Page
**As:** User with 50+ shared videos
**Steps:**
1. Click "Shared" in navigation
2. Wait for load

**Expected Result:**
- Page loads in < 2 seconds
- First 12 videos display
- Pagination works smoothly

---

## Edge Cases

### Test E1: Very Long Email
**Steps:**
1. Try to share with email 255+ characters

**Expected Result:**
- Either truncated or error shown

### Test E2: Special Characters in Email
**Steps:**
1. Share with: test+tag@example.co.uk

**Expected Result:**
- Accepted and works correctly

### Test E3: Case Sensitivity
**Steps:**
1. Share with: Bob@Example.com
2. Try to share again with: bob@example.com

**Expected Result:**
- Treated as same email
- Duplicate error shown

### Test E4: Deleted User Account
**Steps:**
1. Share video with user
2. User deletes their account
3. Verify share still exists

**Expected Result:**
- Share record remains
- Email is preserved
- sharedWithUser becomes null
- Still functions correctly

---

## Browser Compatibility

Test on:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Final Verification Checklist

- [ ] All test cases passed
- [ ] No console errors
- [ ] No unhandled promises
- [ ] Database integrity maintained
- [ ] Performance acceptable
- [ ] UI responsive and intuitive
- [ ] Error messages clear
- [ ] Authorization working
- [ ] Pagination functional
- [ ] Search/filter working
- [ ] Cross-browser compatible
