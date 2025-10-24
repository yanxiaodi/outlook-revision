# Rate Limiting Implementation Guide

## 📋 Overview

This document describes the rate limiting implementation for the ReVision Outlook Add-in API. The system limits the number of API requests each user can make per day to prevent abuse and ensure fair resource allocation.

## 🏗️ Architecture

### Components

1. **Frontend (Outlook Add-in)**
   - Automatically includes user email in all API requests
   - Handles rate limit errors gracefully
   - Displays user-friendly error messages

2. **Backend (ASP.NET Core Web API)**
   - **RateLimitingMiddleware**: Intercepts requests and enforces limits
   - **InMemoryRateLimitService**: Tracks request counts per user
   - **MemoryCache**: Stores request counters with automatic daily reset

## 🔧 Configuration

### appsettings.json

```json
{
  "RateLimiting": {
    "DailyRequestLimit": 100,  // Maximum requests per user per day
    "Enabled": true             // Enable/disable rate limiting
  }
}
```

### Environment-Specific Settings

- **Development** (`appsettings.Development.json`):
  - Limit: 1000 requests/day
  - Enabled: `false` (disabled for easier testing)

- **Production** (`appsettings.Production.json`):
  - Limit: 100 requests/day
  - Enabled: `true` (enforced in production)

## 🔑 How It Works

### 1. Request Flow

```
User makes request → Frontend adds X-User-Email header → 
Middleware checks rate limit → 
If allowed: Process request → 
If exceeded: Return 429 error
```

### 2. User Identification

The user's email address is extracted from:
```typescript
Office.context.mailbox.userProfile.emailAddress
```

And sent in the `X-User-Email` request header.

### 3. Rate Limit Storage

- **Cache Key Format**: `ratelimit:{email}:{date}`
  - Example: `ratelimit:user@example.com:2025-10-15`
- **Value**: Request count (integer)
- **Expiration**: Midnight UTC (automatic daily reset)

### 4. Response Headers

All API responses include:
```
X-RateLimit-Limit: 100          // Total daily limit
X-RateLimit-Remaining: 45       // Requests left today
X-RateLimit-Reset: 1729036800   // Unix timestamp of reset time
```

When limit is exceeded (429 response):
```
Retry-After: 3600               // Seconds until reset
```

## 🚫 Rate Limit Exceeded Response

### HTTP Status: 429 Too Many Requests

```json
{
  "type": "https://tools.ietf.org/html/rfc6585#section-4",
  "title": "Rate Limit Exceeded",
  "status": 429,
  "detail": "Daily request limit of 100 exceeded. Limit resets at 2025-10-16T00:00:00Z",
  "instance": "/api/Outlook/translate"
}
```

### Frontend Error Message

Users see a friendly error message:
```
Daily request limit of 100 exceeded. 
Please try again after 10/16/2025, 12:00:00 AM
```

## 📝 Implementation Files

### Backend Files

| File | Purpose |
|------|---------|
| `RateLimitingOptions.cs` | Configuration class for rate limiting settings |
| `Services/IRateLimitService.cs` | Interface for rate limiting service |
| `Services/InMemoryRateLimitService.cs` | In-memory implementation using MemoryCache |
| `Middleware/RateLimitingMiddleware.cs` | HTTP middleware to enforce rate limits |
| `Program.cs` | Service registration and middleware configuration |

### Frontend Files

| File | Purpose |
|------|---------|
| `services/RealReVisionService.ts` | Updated to include user email header and handle 429 errors |

## 🧪 Testing Rate Limiting

### Test Scenario 1: Normal Usage

1. Make requests to any API endpoint
2. Check response headers for rate limit info:
   ```
   X-RateLimit-Limit: 100
   X-RateLimit-Remaining: 99
   X-RateLimit-Reset: 1729036800
   ```

### Test Scenario 2: Exceeding Limit

1. Make 101 requests in a day
2. The 101st request should return:
   - Status: 429
   - Error message with reset time
   - `X-RateLimit-Remaining: 0`

### Test Scenario 3: Daily Reset

1. Wait until midnight UTC
2. Counter automatically resets
3. Full quota available again

### Manual Testing with PowerShell

```powershell
# Test with user email header
$headers = @{
    "X-User-Email" = "test@example.com"
    "Content-Type" = "application/json"
}

$body = @{
    emailBody = "Test message"
    targetLanguage = "English"
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "https://your-api-url/api/Outlook/translate" `
    -Method POST `
    -Headers $headers `
    -Body $body

# Check rate limit headers
$response.Headers["X-RateLimit-Remaining"]
$response.Headers["X-RateLimit-Reset"]
```

## 📊 Monitoring

### Logs

The implementation logs important events:

```
[Information] Created new rate limit counter for user@example.com. Expires at 2025-10-16 00:00:00 UTC
[Debug] Request counted for user@example.com. Count: 5/100
[Warning] Rate limit exceeded for user@example.com on /api/Outlook/translate
```

### Metrics to Monitor

- Number of 429 responses (rate limit hits)
- Users hitting the limit frequently
- Peak usage times
- Average requests per user

## 🚀 Future Enhancements

### Scaling to Multiple Instances

When you need to scale to multiple server instances, you can implement a Redis-based rate limiter:

1. Create `RedisRateLimitService` implementing `IRateLimitService`
2. Update `Program.cs` to use Redis instead of MemoryCache
3. No changes needed to middleware or frontend

Example Redis configuration:
```csharp
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = "your-redis-connection-string";
});
builder.Services.AddSingleton<IRateLimitService, RedisRateLimitService>();
```

### Additional Features to Consider

- ✨ Different limits for different API endpoints
- 🎯 Tiered limits based on user subscription level
- 📈 Burst allowance (e.g., 20 requests per minute + 100 per day)
- 🔔 Email notifications when approaching limit
- 📊 User dashboard showing usage statistics
- ⚙️ Admin API to adjust limits per user

## ❓ FAQ

### Q: What happens if the server restarts?

**A:** All rate limit counters are reset. This is a limitation of in-memory storage. For production environments with frequent restarts, consider using Redis.

### Q: Can I increase the limit for specific users?

**A:** Currently, all users share the same limit. To implement per-user limits, extend `InMemoryRateLimitService` to check user-specific overrides from configuration or database.

### Q: What timezone is used for the daily reset?

**A:** UTC is used for consistency across all users regardless of their location.

### Q: Can I disable rate limiting temporarily?

**A:** Yes, set `"RateLimiting:Enabled": false` in `appsettings.json` and restart the API.

### Q: What if the user email is not available?

**A:** The middleware returns a 400 Bad Request error indicating the `X-User-Email` header is required.

## 🔒 Security Considerations

- ✅ User email is read directly from Office context (trusted source)
- ✅ Rate limits prevent abuse and DoS attacks
- ✅ Counters are case-insensitive for email addresses
- ⚠️ Email addresses are logged for monitoring - ensure compliance with privacy policies
- ⚠️ Consider hashing email addresses in cache keys for additional privacy

## 📚 References

- [RFC 6585 - Additional HTTP Status Codes](https://tools.ietf.org/html/rfc6585#section-4)
- [ASP.NET Core Middleware](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/middleware/)
- [MemoryCache Documentation](https://docs.microsoft.com/en-us/dotnet/api/microsoft.extensions.caching.memory.memorycache)
- [Office.js API Reference](https://docs.microsoft.com/en-us/javascript/api/outlook)

---

**Last Updated:** October 15, 2025  
**Version:** 1.0.0
