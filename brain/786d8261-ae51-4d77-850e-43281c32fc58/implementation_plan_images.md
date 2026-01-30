# Implementation Plan - Add Real Product Images

## Goal
Replace placeholder images with high-quality generated assets served from the backend.

## Proposed Changes

### Server
1.  **Generate Images**: Create 5 images for the products defined in `seed.js`.
    *   `auto-farmer.png` (GenLogin Auto-Farmer)
    *   `gpm-manager.png` (GPM Login Manager)
    *   `node-spoofer.png` (MoreLogin Spoofer)
    *   `dropshipping-course.png` (Elite Dropshipping Course)
    *   `license-key.png` (GPM Login License)
    *   `auto-reg.png` (Hidemyacc Auto-Reg)
2.  **Save Location**: Save these images to `server/uploads/`.
3.  **Update Seed Data**: Modify `server/seed.js` to point `image` fields to `http://localhost:5000/uploads/<filename>`.

## Verification Plan

### Automated Verification
1.  Run `docker-compose up -d --build server` to restart server and re-seed database.
2.  (Implicit) Trigger re-seed. *Wait, `seed.js` is a manual script or runs on start?*
    *   Checking `package.json`: `seed.js` is a standalone script.
    *   I need to run `node seed.js` inside the container or locally.
    *   Since I am changing `seed.js`, I will run it via `docker exec app-server-1 node seed.js`.

### User Verification
1.  Browser check at `http://localhost:8080/shop`.
2.  Verify images load correctly and are not placeholders.
