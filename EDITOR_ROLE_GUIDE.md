# Editor Role - Complete Capabilities

## What Editor Role Can Do

### ✅ Upload Videos
**Endpoint:** `POST /api/videos/upload`  
**Status:** Allowed via auth middleware  
**Details:** Editors can upload any video file up to 2GB

### ✅ Edit Video Metadata
**Endpoint:** `PATCH /api/videos/:id`  
**Status:** Newly implemented  
**What can be edited:**
- Video title (up to 100 characters)
- Video description (up to 500 characters)
- Both title and description

**Authorization:**
- Only can edit own videos
- Not videos shared with them

### ✅ Share Videos
**Endpoint:** `POST /api/videos/:id/share`  
**Status:** Available  
**Requirements:**
- Recipient email must be registered user
- Can assign roles: Viewer or Editor

**Restrictions:**
- Only can share own videos
- Cannot share with unregistered emails (new validation)

### ✅ Manage Shares
**Endpoints:**
- `GET /api/videos/:id/shares` - View all shares
- `PUT /api/shares/:shareId` - Update role
- `DELETE /api/shares/:shareId` - Remove share

**Status:** Available  
**Restrictions:**
- Only for own videos

### ✅ Delete Videos
**Endpoint:** `DELETE /api/videos/:id`  
**Status:** Allowed  
**What happens:**
- Video file removed
- Video record deleted
- All shares removed

### ✅ View Videos
**Endpoint:** `GET /api/videos`  
**Status:** Allowed  
**What they see:**
- Own uploaded videos
- Videos shared with them (as viewer or editor)

### ✅ Play Videos
**Endpoint:** `GET /api/videos/:id/stream`  
**Status:** Allowed  
**What they can play:**
- Own videos
- Videos shared with them

---

## What Editor Role CANNOT Do

### ❌ Upload as Viewer
- Only editors and admins can upload

### ❌ Edit Others' Videos
- Cannot edit videos they don't own
- Even if shared as editor role

### ❌ Share with Unregistered Users
- Recipients must be registered users
- Returns error for unregistered emails

### ❌ Access All Users' Videos
- Cannot see other users' videos
- Only own and shared videos visible

### ❌ Change Own Role
- Cannot escalate to admin
- Only admins can change roles

### ❌ Delete Shared Shares
- Cannot remove shares on videos shared with them
- Only video owner can manage shares

---

## Editor Permissions Table

| Action | Own Video | Shared Video | Others' Video |
|--------|-----------|--------------|---------------|
| Upload | ✅ | N/A | ❌ |
| View Metadata | ✅ | ✅ | ❌ |
| Edit Metadata | ✅ | ❌ | ❌ |
| Play/Stream | ✅ | ✅ | ❌ |
| Share | ✅ | ❌ | ❌ |
| Manage Shares | ✅ | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ |

---

## How to Use Editor Features

### Uploading a Video
1. Login with editor account
2. Navigate to Upload page
3. Select video file
4. Enter title and description
5. Click Upload
6. Video is processed and appears in Library

### Editing Video Details
1. Go to Library
2. Find your video
3. Click Edit button (pencil icon)
4. Update title and/or description
5. Click "Save Changes"
6. Video is updated

### Sharing Videos
1. Go to Library
2. Find your video
3. Click Share button (chain icon)
4. Enter registered user's email
5. Select role (Viewer/Editor)
6. Click "Share Video"
7. Go to "Manage" tab to see shares

### Managing Shares
1. Click Share button on your video
2. Click "Manage" tab
3. View all shares
4. Update role by clicking new role button
5. Remove share by clicking "Remove"

---

## API Request Examples

### Update Video Title
```bash
PATCH /api/videos/507f1f77bcf86cd799439012
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "New Video Title"
}
```

### Update Video Description
```bash
PATCH /api/videos/507f1f77bcf86cd799439012
Content-Type: application/json
Authorization: Bearer <token>

{
  "description": "Updated description"
}
```

### Update Both
```bash
PATCH /api/videos/507f1f77bcf86cd799439012
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "New Title",
  "description": "New description"
}
```

### Share with Another Editor
```bash
POST /api/videos/507f1f77bcf86cd799439012/share
Content-Type: application/json
Authorization: Bearer <token>

{
  "email": "colleague@example.com",
  "role": "editor"
}
```

**Note:** Email must be a registered user, otherwise returns error.

---

## Common Scenarios

### Scenario 1: Editor Uploads and Shares
1. Editor Alice uploads "Project A"
2. Edits title to "Project A - Final"
3. Shares with Editor Bob as "editor"
4. Bob receives share notification
5. Bob can now view, play, and (future) edit the video

**Result:** ✅ Works

### Scenario 2: Editor Tries to Share with Unregistered Email
1. Editor Alice tries to share with "unknown@example.com"
2. System checks if email is registered
3. Email is not registered
4. Error shown: "User with this email is not registered..."

**Result:** ❌ Fails with clear error

### Scenario 3: Editor Updates Video Details
1. Editor Alice has uploaded video
2. Clicks Edit button
3. Changes title from "Draft" to "Final Version"
4. Updates description
5. Clicks Save
6. Video is updated in database

**Result:** ✅ Works

### Scenario 4: Editor Tries to Edit Shared Video
1. Editor Alice receives video from Editor Bob with editor role
2. Alice tries to click Edit
3. Edit is only available for own videos
4. Alice cannot edit

**Result:** ❌ Cannot edit (by design)

---

## Role Upgrade Path

**Current Role Hierarchy:**
1. **Viewer** - Can only watch videos
2. **Editor** - Can upload, edit, share, manage
3. **Admin** - Full system access

**How to upgrade:**
- Contact system administrator
- Cannot self-upgrade
- Only admins can change roles

---

## Error Handling

### Common Editor Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Unauthorized. Only video owner can edit" | Trying to edit someone else's video | Only edit your own videos |
| "User with this email is not registered" | Sharing with non-registered email | Ask recipient to register first |
| "Video not found" | Video ID incorrect or deleted | Check video still exists |
| "No changes made" | Editing without changing anything | Make actual changes |
| "Title is required" | Title field empty | Enter a video title |

---

## Best Practices for Editors

1. **Before Sharing:**
   - Verify recipient email is registered
   - Ask recipient to create account first if needed

2. **When Editing:**
   - Use clear, descriptive titles
   - Add helpful descriptions
   - Review before saving

3. **When Sharing:**
   - Share with "Viewer" if recipient only needs to watch
   - Share with "Editor" if recipient needs to edit/manage
   - Manage shares regularly

4. **Security:**
   - Don't share with multiple people unnecessarily
   - Remove shares when collaboration ends
   - Review share list regularly

---

## Comparison with Other Roles

| Capability | Viewer | Editor | Admin |
|------------|--------|--------|-------|
| Upload | ❌ | ✅ | ✅ |
| Edit Own Videos | ❌ | ✅ | ✅ |
| Share Own Videos | ❌ | ✅ | ✅ |
| Delete Own Videos | ❌ | ✅ | ✅ |
| View All Videos | ❌ | ❌ | ✅ |
| Manage All Users | ❌ | ❌ | ✅ |
| System Settings | ❌ | ❌ | ✅ |

---

## Support & Troubleshooting

**Issue:** "Can't see Edit button"  
**Solution:** Make sure you're viewing your own videos

**Issue:** "Share fails with email not registered"  
**Solution:** Ask the person to register first, then try again

**Issue:** "Changes not saving"  
**Solution:** Check internet connection, try again

**Issue:** "Want to edit someone else's video"  
**Solution:** Ask the owner to share with editor role, then you can edit

---

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** ✅ Production Ready
