# ✅ Feedback Feature - Ready to Test!

## 🎉 Configuration Complete

The Logic Apps URL has been securely stored in user secrets and is ready to use.

## 📋 Pre-Test Checklist

- ✅ Frontend feedback form created
- ✅ Backend API endpoint created (`/api/feedback/submit`)
- ✅ Logic Apps HTTP trigger configured
- ✅ Logic Apps URL stored in user secrets
- ✅ Email template configured in Logic Apps
- ✅ Documentation created

## 🚀 Testing Steps

### Step 1: Start the Backend API

```powershell
cd src/api/FunCoding.ReVision.WebApi/FunCoding.ReVision.WebApi
dotnet run
```

**Expected output:**
```
ReVision Web API started successfully. Ready to accept requests.
info: Microsoft.Hosting.Lifetime[0]
      Now listening on: https://localhost:7000
```

### Step 2: Start the Frontend

In a new terminal:
```powershell
cd src/add-in/OutlookReVision
npm run dev-server:local
```

**Expected output:**
```
webpack compiled successfully
Outlook add-in running on https://localhost:3000
```

### Step 3: Open the Add-in

1. Open Outlook (Desktop, Web, or Mac)
2. Open any email (read or compose mode)
3. Click the ReVision add-in icon
4. Click the **Feedback** tab

### Step 4: Submit Test Feedback

Fill in the form:
- **First Name**: Test
- **Last Name**: User
- **Email**: your-email@example.com
- **Feedback Type**: Select "General Feedback"
- **Rating**: Click 5 stars ⭐⭐⭐⭐⭐
- **Message**: "This is a test of the feedback feature"

Click **Submit Feedback**

### Step 5: Verify Success

**Frontend:**
- ✅ See success toast notification
- ✅ See green success message box
- ✅ Form resets after 3 seconds

**Backend Logs:**
```
[Information] Sending feedback to Logic Apps for Test User (General Feedback)
[Information] Feedback submitted successfully for your-email@example.com
```

**Email:**
- ✅ Check your email inbox
- ✅ Subject: `[General Feedback] ReVision Feedback from Test User`
- ✅ Body contains all the information in formatted HTML

## 🧪 Test Cases

### Test Case 1: Valid Submission with Rating
- **Input**: All required fields + rating
- **Expected**: Success, email received with rating shown

### Test Case 2: Valid Submission without Rating
- **Input**: All required fields, no rating
- **Expected**: Success, email shows "Not provided" for rating

### Test Case 3: Missing Required Fields
- **Input**: Leave firstName empty
- **Expected**: Error toast "Please enter your first name"

### Test Case 4: Invalid Email Format
- **Input**: Email = "notanemail"
- **Expected**: Error toast "Please enter a valid email address"

### Test Case 5: Different Feedback Types
- **Input**: Try each type (Bug Report, Feature Request, General Feedback, Other)
- **Expected**: Subject line shows correct type in brackets

### Test Case 6: Long Message
- **Input**: Message with 500+ characters
- **Expected**: Success, full message in email

### Test Case 7: Special Characters
- **Input**: Message with emojis, quotes, etc.
- **Expected**: Success, characters preserved in email

## 🔍 Debugging

### Backend Not Starting?
Check if the port is already in use:
```powershell
netstat -ano | findstr :7000
```

### Frontend Not Connecting to Backend?
Check `src/add-in/OutlookReVision/src/config/environment.ts`:
```typescript
export const getApiHost = () => {
  return "https://localhost:7000"; // Should match backend port
};
```

### Logic Apps Not Receiving Data?
1. Check Azure Portal → Your Logic App → Runs history
2. Look for failed runs
3. Expand the HTTP trigger to see the payload

### Email Not Received?
1. Check spam/junk folder
2. Verify Office 365 connection in Logic App
3. Check Logic Apps run history for errors
4. Try a different email address

## 📊 Expected Email Format

**Subject:**
```
[General Feedback] ReVision Feedback from Test User
```

**Body (HTML formatted):**
```
📧 New Feedback - Outlook ReVision

[General Feedback]

👤 Contact Information
Name:     Test User
Email:    your-email@example.com
Rating:   5/5 ⭐

💬 Feedback Message
This is a test of the feedback feature

🔧 Technical Information
Submitted:        2025-10-12T14:30:15.123Z
Add-in Version:   1.0.0
Platform:         Windows
Outlook Version:  16.0.14326.20404
```

## ✨ Success Criteria

- ✅ Form validation works
- ✅ Star rating functions correctly
- ✅ Backend receives request
- ✅ Backend forwards to Logic Apps
- ✅ Logic Apps sends email
- ✅ Email received with correct formatting
- ✅ Success feedback shown to user
- ✅ Form resets after submission
- ✅ Errors handled gracefully

## 🎯 Next Steps After Testing

1. **Test with real users** - Get feedback on the feedback form 😄
2. **Monitor usage** - Check Application Insights for submissions
3. **Analyze feedback** - Review incoming feedback emails
4. **Iterate** - Make improvements based on user needs

## 📝 Notes

- The Logic Apps URL is stored securely in user secrets
- Timestamp is added by the backend (server-side)
- Rating is optional (0 = not provided)
- All metadata is auto-collected from the browser

## 🆘 Need Help?

1. Check backend logs in the terminal
2. Check browser console (F12) for frontend errors
3. Check Logic Apps run history in Azure Portal
4. Review [FEEDBACK_SETUP.md](./FEEDBACK_SETUP.md) for configuration
5. Review [USER_SECRETS_GUIDE.md](./USER_SECRETS_GUIDE.md) for secrets management

---

**Configuration Date**: October 12, 2025  
**Logic Apps Region**: Australia East  
**Status**: ✅ Ready to test!

Happy testing! 🚀
