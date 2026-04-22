# Chrome Web Store Submission Checklist

## ✅ COMPLETED

### Code & Technical Requirements
- [x] **Manifest V3** - Using latest manifest version
- [x] **Code Readability** - No obfuscation, only bundling with Rollup
- [x] **No Remote Code** - All scripts are local, no eval() or external execution
- [x] **API Usage** - Using Chrome APIs correctly (storage, notifications)
- [x] **Icons** - All 4 sizes (16x16, 32x32, 48x48, 128x128) in PNG format
- [x] **Permissions Justified** - Minimal permissions with clear justifications

### Privacy & Data
- [x] **Privacy Policy** - Comprehensive policy created
- [x] **Contact Email** - Added: martianonmarsandearth@gmail.com
- [x] **Limited Use Statement** - Added to privacy policy
- [x] **Data Usage Disclosure** - Detailed in STORE_LISTING.md
- [x] **Secure Data Handling** - HTTPS, JWT auth, bcrypt passwords

### Content & Listing
- [x] **Single Purpose** - Clear focus on job application tracking
- [x] **Description** - Detailed and accurate
- [x] **No Misleading Claims** - Honest feature descriptions
- [x] **Category** - Productivity

## ⚠️ ACTION REQUIRED BEFORE SUBMISSION

### 1. Developer Account Setup
- [ ] **Enable 2-Step Verification** on your Google developer account
  - Go to: https://myaccount.google.com/security
  - Enable 2-Step Verification

### 2. Privacy Policy URL
- [ ] **Verify URL is accessible**: https://job-tracker-jwue.vercel.app/privacy-policy
  - Must be publicly accessible
  - Must display the privacy policy content
  - Test in incognito mode to confirm

### 3. Screenshots & Promotional Images
Prepare the following images:

**Screenshots (1280x800 or 640x400):**
- [ ] Extension popup showing status and dashboard button
- [ ] LinkedIn job page with tracking notification
- [ ] Dashboard showing tracked applications
- [ ] Settings page
- [ ] Naukri tracking in action

**Promotional Images:**
- [ ] Small tile: 440x280
- [ ] Large tile: 920x680
- [ ] Marquee: 1400x560

### 4. Store Listing Information
Copy from `STORE_LISTING.md`:
- [ ] Extension name
- [ ] Short description (132 chars max)
- [ ] Detailed description
- [ ] Category: Productivity
- [ ] Language: English
- [ ] Privacy Policy URL
- [ ] Support URL/Website

### 5. Permission Justifications
When submitting, provide these justifications:

**storage:**
```
Required to save authentication tokens and job application data locally. Stores user preferences and settings for offline access.
```

**notifications:**
```
Shows success/error notifications when tracking jobs. Alerts users about pending application confirmations that require action.
```

**host_permissions (linkedin.com, naukri.com):**
```
Required to detect "Apply" button clicks on job pages and extract job details (title, company, location) from the page. Only activates on job-related pages to track applications.
```

### 6. Single Purpose Description
```
This extension tracks job applications on LinkedIn and Naukri, helping users organize their job search by automatically saving application details to a personal dashboard.
```

### 7. Final Testing
- [ ] Test extension in fresh Chrome profile
- [ ] Verify all features work correctly
- [ ] Test on both LinkedIn and Naukri
- [ ] Verify notifications appear correctly
- [ ] Test dashboard integration
- [ ] Check for console errors

### 8. Build for Production
```bash
cd extension
npm run build
```

### 9. Create ZIP Package
Include these files in your ZIP:
- manifest.json
- dist/ folder (all built files)
- icons/ folder (all PNG icons)
- PRIVACY_POLICY.md
- Any other required assets

**DO NOT include:**
- node_modules/
- .git/
- Source .js files (only dist/ files)
- package.json, rollup.config.js (not needed in production)

## 📋 POLICY COMPLIANCE SUMMARY

### ✅ Fostering a Safe Ecosystem
- No mature/sexual content
- No malicious code
- No hate speech or violence
- No regulated goods/services

### ✅ Protecting User Privacy
- Privacy policy posted and accessible
- Limited use of data clearly stated
- Narrowest permissions requested
- Disclosure requirements met
- Secure data handling (HTTPS, encryption)

### ✅ Responsible Marketing
- No impersonation
- No deceptive installation tactics
- No misleading behavior
- Clear functionality description

### ✅ Building Quality Products
- Single, clear purpose
- No spam or abuse
- Quality guidelines followed
- Minimum functionality provided
- No remote code execution

## 🚀 SUBMISSION STEPS

1. Go to: https://chrome.google.com/webstore/devconsole
2. Click "New Item"
3. Upload your ZIP file
4. Fill in all store listing information
5. Upload screenshots and promotional images
6. Fill in privacy practices
7. Submit for review

## ⏱️ REVIEW TIME
- Typical review: 1-3 business days
- First submission may take longer
- Check email for any review feedback

## 📧 SUPPORT
If you receive feedback from Chrome Web Store reviewers:
- Respond promptly to review emails
- Address all concerns raised
- Resubmit with clear explanation of changes

---

**Last Updated:** February 2, 2026
**Extension Version:** 1.0.1
**Contact:** martianonmarsandearth@gmail.com
