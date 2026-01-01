# Enhanced Features Testing Guide

## Test Setup

### Prerequisites
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd my-app && npm run dev`
3. Create 3 test accounts:
   - Account A: alice@example.com (editor)
   - Account B: bob@example.com (editor)
   - Account C: charlie@example.com (viewer)

---

## Test Case 1: Share Restriction - Unregistered Email

**Objective:** Verify that sharing with unregistered emails throws an error

**As:** Account A  
**Steps:**
1. Login with alice@example.com
2. Upload a test video: "Test Video 1"
3. Click Share button
4. Enter email: notregistered@example.com
5. Select role: Viewer
6. Click "Share Video"

**Expected Result:**
- ❌ Error message appears
- ❌ Message says: "User with this email is not registered. Please share only with registered users."
- ❌ Share is NOT created
- ❌ Modal remains open

**Actual Result:** _______________

---

## Test Case 2: Share Success - Registered Email

**Objective:** Verify sharing works with registered emails

**As:** Account A  
**Steps:**
1. Still in Share modal for "Test Video 1"
2. Clear previous email
3. Enter email: bob@example.com (registered)
4. Select role: Viewer
5. Click "Share Video"

**Expected Result:**
- ✅ Success message appears
- ✅ Message says: "Video shared with bob@example.com as viewer"
- ✅ Share is created
- ✅ Modal closes
- ✅ Share appears in Manage tab

**Actual Result:** _______________

---

## Test Case 3: Edit Video Title

**Objective:** Verify editor can edit video title

**As:** Account A  
**Steps:**
1. Go to Library
2. Find "Test Video 1"
3. Click Edit button (pencil icon)
4. Modal opens showing current title
5. Clear title field
6. Enter new title: "Test Video 1 - Updated"
7. Click "Save Changes"

**Expected Result:**
- ✅ Edit modal opens
- ✅ Current title is shown
- ✅ Character counter shows title length
- ✅ Success message appears: "Video updated successfully"
- ✅ Modal closes
- ✅ Library refreshes
- ✅ Video title changed to "Test Video 1 - Updated"

**Actual Result:** _______________

---

## Test Case 4: Edit Video Description

**Objective:** Verify editor can edit video description

**As:** Account A  
**Steps:**
1. Click Edit button on "Test Video 1 - Updated"
2. Keep title as is
3. Enter description: "This is an updated description for testing"
4. Click "Save Changes"

**Expected Result:**
- ✅ Edit modal shows current description
- ✅ Description can be entered
- ✅ Character counter updates (should show ~42/500)
- ✅ Success message appears
- ✅ Description is saved
- ✅ Modal closes

**Actual Result:** _______________

---

## Test Case 5: Edit Both Title and Description

**Objective:** Verify both fields can be edited together

**As:** Account A  
**Steps:**
1. Click Edit on "Test Video 1 - Updated"
2. Change title to: "Final Test Video"
3. Change description to: "Final version for testing all features"
4. Click "Save Changes"

**Expected Result:**
- ✅ Both fields updated
- ✅ Success message appears
- ✅ Modal closes
- ✅ Library shows new title and description

**Actual Result:** _______________

---

## Test Case 6: Edit Validation - No Changes

**Objective:** Verify error when no changes made

**As:** Account A  
**Steps:**
1. Click Edit button
2. Don't modify anything
3. Click "Save Changes"

**Expected Result:**
- ❌ Error message appears
- ❌ Message says: "No changes made"
- ❌ Modal stays open
- ❌ Can close and try again

**Actual Result:** _______________

---

## Test Case 7: Edit Validation - Empty Title

**Objective:** Verify error when title is empty

**As:** Account A  
**Steps:**
1. Click Edit button
2. Clear the title field completely
3. Click "Save Changes"

**Expected Result:**
- ❌ Error message appears
- ❌ Message says: "Title is required"
- ❌ Modal stays open

**Actual Result:** _______________

---

## Test Case 8: Share After Edit

**Objective:** Verify sharing still works after editing

**As:** Account A  
**Steps:**
1. Click Share on "Final Test Video"
2. Try to share with bob@example.com again

**Expected Result:**
- ❌ Error message: "Video already shared with this email"

**As:** Account A  
**Steps (continued):**
1. Clear email
2. Enter email: charlie@example.com (viewer account)
3. Select role: Editor
4. Click "Share Video"

**Expected Result:**
- ✅ Success message
- ✅ Share created with Charlie as editor
- ✅ Both Bob and Charlie appear in Manage tab

**Actual Result:** _______________

---

## Test Case 9: Shared User Cannot Edit

**Objective:** Verify shared users cannot edit videos

**As:** Account B (Bob - viewer of Alice's video)  
**Steps:**
1. Logout from Account A
2. Login with bob@example.com
3. Go to "Shared" page
4. Find "Final Test Video"
5. Look for Edit button

**Expected Result:**
- ❌ No Edit button visible
- ✅ Only Play button visible
- ℹ️ Edit button not available for shared videos

**Actual Result:** _______________

---

## Test Case 10: Shared User Can Play

**Objective:** Verify shared users can still play videos

**As:** Account B  
**Steps:**
1. Still in Shared page
2. Find "Final Test Video"
3. Click Play

**Expected Result:**
- ✅ Video player opens
- ✅ Video plays successfully
- ✅ No access errors

**Actual Result:** _______________

---

## Test Case 11: Editor Shared User Can Edit (Future)

**Objective:** Note that current version doesn't allow edit for shared editors yet

**As:** Account C (Charlie - editor of Alice's video)  
**Steps:**
1. Logout from Account B
2. Login with charlie@example.com
3. Go to Shared page
4. Look for Edit button on "Final Test Video"

**Current Behavior:** ℹ️  
- Edit button is NOT shown (owner-only for now)
- This is by design - future enhancement can allow

**Actual Result:** _______________

---

## Test Case 12: Character Limits

**Objective:** Verify character limits in edit modal

**As:** Account A  
**Steps:**
1. Click Edit on any video
2. Enter a very long title (>100 chars)
3. Try to type more

**Expected Result:**
- ✅ Title input stops at 100 characters
- ✅ Character counter shows "100/100"
- ✅ Cannot type more

**As:** Account A (continued)  
**Steps:**
1. Click in description field
2. Type very long text (>500 chars)

**Expected Result:**
- ✅ Description stops at 500 characters
- ✅ Character counter shows "500/500"
- ✅ Cannot type more

**Actual Result:** _______________

---

## Test Case 13: Multiple Shares with Different Roles

**Objective:** Verify multiple shares with different roles work

**As:** Account A  
**Steps:**
1. Create 3 accounts: alice, bob, charlie (if not already)
2. Upload a new video: "Multi-Share Test"
3. Share with bob@example.com as Viewer
4. Share with charlie@example.com as Editor
5. Go to Manage tab

**Expected Result:**
- ✅ Both shares visible
- ✅ Bob shown with Viewer role
- ✅ Charlie shown with Editor role
- ✅ Can update roles independently
- ✅ Can remove shares independently

**Actual Result:** _______________

---

## Test Case 14: Update Share Role After Edit

**Objective:** Verify share roles can be updated after video edit

**As:** Account A  
**Steps:**
1. Edit "Multi-Share Test" title
2. Go to Share → Manage
3. Click Editor button next to Bob's share
4. Now Bob has Editor role

**Expected Result:**
- ✅ Edit and role update work independently
- ✅ Both features coexist
- ✅ Video appears with new title
- ✅ Share has new role

**Actual Result:** _______________

---

## Test Case 15: API Testing - Direct PATCH Request

**Objective:** Test the edit API directly

**Using:** Postman or curl

**Steps:**
```bash
PATCH http://localhost:5000/api/videos/<video_id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "API Updated Title",
  "description": "API Updated Description"
}
```

**Expected Result:**
- ✅ 200 OK response
- ✅ Video updated
- ✅ Response includes updated video object

**Actual Result:** _______________

---

## Test Case 16: Authorization - Non-Owner Cannot Edit

**Objective:** Verify non-owners cannot edit via API

**As:** Account B (Bob)  
**Steps:**
1. Try to PATCH video owned by Account A
2. Use Bob's token

**Expected Result:**
- ❌ 403 Forbidden response
- ❌ Error message: "Unauthorized. Only video owner can edit"

**Actual Result:** _______________

---

## Test Case 17: Share Restriction with API

**Objective:** Test share restriction via API

**As:** Account A  
**Steps:**
```bash
POST http://localhost:5000/api/videos/<video_id>/share
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "unregistered@example.com",
  "role": "viewer"
}
```

**Expected Result:**
- ❌ 400 Bad Request
- ❌ Error message: "User with this email is not registered..."

**Actual Result:** _______________

---

## Test Case 18: Database Verification

**Objective:** Verify data is correctly stored in database

**Check:** MongoDB

**Expected Data:**

Video Collection:
```javascript
{
  _id: ObjectId,
  title: "Final Test Video",  // Updated
  description: "Final version for testing...",  // Updated
  // ... other fields unchanged
}
```

Share Collection:
```javascript
// Should have 2 shares for this video
{
  videoId: ObjectId,
  sharedWithEmail: "bob@example.com",
  role: "editor"  // Updated from viewer
}
```

**Actual Result:** _______________

---

## Test Case 19: UI Responsiveness - Mobile

**Objective:** Verify edit modal works on mobile

**Device:** Mobile phone or responsive browser

**Steps:**
1. Open on mobile
2. Click Edit button
3. Edit modal opens
4. Enter text on mobile keyboard
5. Save changes

**Expected Result:**
- ✅ Modal is responsive
- ✅ Text input works on mobile
- ✅ Character counters visible
- ✅ Buttons properly sized
- ✅ No overflow issues

**Actual Result:** _______________

---

## Test Case 20: Error Recovery

**Objective:** Verify user can recover from errors

**As:** Account A  
**Steps:**
1. Click Edit
2. Try to save without title
3. See error
4. Enter title
5. Try to save again

**Expected Result:**
- ✅ Error shown first
- ✅ Can fix and retry
- ✅ Second attempt succeeds
- ✅ No data corruption

**Actual Result:** _______________

---

## Summary Report

### Features Tested
- [ ] Unregistered email share restriction
- [ ] Registered email sharing
- [ ] Edit video title
- [ ] Edit video description
- [ ] Edit both fields
- [ ] Edit validation - no changes
- [ ] Edit validation - empty title
- [ ] Share after edit
- [ ] Shared user cannot edit
- [ ] Shared user can play
- [ ] Character limits
- [ ] Multiple shares
- [ ] Update role after edit
- [ ] API direct testing
- [ ] Authorization checks
- [ ] Database verification
- [ ] Mobile responsiveness
- [ ] Error recovery

### Pass Rate: ___ / 20

### Issues Found:
```
1. 
2. 
3. 
```

### Overall Status: _______________

---

**Test Date:** ________________  
**Tester:** ________________  
**Browser/Device:** ________________  
**Notes:** ________________
