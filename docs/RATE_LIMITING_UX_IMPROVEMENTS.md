# Rate Limiting UX Improvements

## Overview
This document describes the user experience improvements made to the rate limiting feature to provide clear, actionable feedback to users when they exceed their daily request limits.

## Problem Statement
Previously, when users hit the rate limit, they would only see a generic error message like "Failed to translate text" without understanding:
- What happened (rate limit exceeded)
- When they can use the service again (reset time)
- What they can do about it (upgrade subscription)

## Solution Design

### Backend Changes (RealReVisionService.ts)

#### 1. Enhanced Error Message Format
The `handleRateLimitError()` method now returns a specially formatted error string:

```typescript
private handleRateLimitError(response: Response): string {
  const resetTime = response.headers.get("X-RateLimit-Reset");
  const limit = response.headers.get("X-RateLimit-Limit");
  
  let formattedTime = "later";
  if (resetTime) {
    const resetDate = new Date(resetTime);
    formattedTime = resetDate.toLocaleTimeString();
  }
  
  const message = `You have reached your daily request limit (${limit || 'unknown'} requests). ` +
                 `The limit will reset at ${formattedTime}. ` +
                 `Please consider upgrading your subscription for higher limits and additional features.`;
  
  // Return with special marker for UI detection
  return `[RATE_LIMIT_EXCEEDED]${message}|RESET:${formattedTime}`;
}
```

**Key Features:**
- `[RATE_LIMIT_EXCEEDED]` marker: Allows UI components to detect this specific error type
- Formatted reset time: User-friendly time display (e.g., "3:00 PM")
- Upgrade suggestion: Guides users toward subscription options
- Pipe-separated format: Enables parsing in UI components

### Frontend Changes (React Components)

#### 2. Component Error Handling Pattern
All feature components now use a consistent pattern to detect and display rate limit errors:

```typescript
if (!result.success) {
  console.error("Operation failed:", result.error);
  
  // Check if it's a rate limit error
  if (result.error?.includes('[RATE_LIMIT_EXCEEDED]')) {
    const parts = result.error.split('|RESET:');
    const message = parts[0].replace('[RATE_LIMIT_EXCEEDED]', '');
    showToast(ToastType.Error, message);
    return;
  }
  
  // Handle other error types...
}
```

**Components Updated:**
1. ✅ `Translate.tsx` - Translation feature
2. ✅ `Reply.tsx` - Reply generation feature
3. ✅ `Compose.tsx` - Email composition feature
4. ✅ `Revise.tsx` - Email analysis and revision features

#### 3. Localized Messages

Added rate limit messages to all supported languages:

**English (en.ts):**
```typescript
toasts: {
  rateLimitExceeded: "You have reached your daily request limit ({{limit}} requests). The limit will reset at {{resetTime}}. Please consider upgrading your subscription for higher limits and additional features.",
  rateLimitExceededShort: "Daily limit reached. Resets at {{resetTime}}. Consider upgrading."
}
```

**Chinese (zh-CN.ts):**
```typescript
toasts: {
  rateLimitExceeded: "您已达到每日请求限额（{{limit}} 次请求）。限额将在 {{resetTime}} 重置。请考虑升级您的订阅以获得更高的限额和更多功能。",
  rateLimitExceededShort: "达到每日限额。重置时间：{{resetTime}}。请考虑升级订阅。"
}
```

**Norwegian (no.ts):**
```typescript
error: {
  rateLimitExceeded: "Du har nådd din daglige forespørselsgrense ({{limit}} forespørsler). Grensen tilbakestilles klokken {{resetTime}}. Vurder å oppgradere abonnementet ditt for høyere grenser og flere funksjoner.",
  rateLimitExceededShort: "Daglig grense nådd. Tilbakestilles: {{resetTime}}. Vurder å oppgradere."
}
```

## User Experience Flow

### Before Rate Limit Exceeded
1. User makes requests normally
2. Each request includes `X-User-Email` header
3. Backend tracks request count per user per day

### When Rate Limit Exceeded
1. Backend returns `429 Too Many Requests` with headers:
   - `X-RateLimit-Limit`: Total daily limit (e.g., "10")
   - `X-RateLimit-Remaining`: "0"
   - `X-RateLimit-Reset`: ISO timestamp (e.g., "2024-01-15T00:00:00Z")
   - `Retry-After`: Seconds until reset

2. Frontend `RealReVisionService`:
   - Detects 429 status code
   - Calls `handleRateLimitError()`
   - Formats error message with reset time
   - Returns error with `[RATE_LIMIT_EXCEEDED]` marker

3. React Component:
   - Detects marker in error string
   - Parses message and reset time
   - Displays user-friendly toast notification

4. User sees message:
   > "You have reached your daily request limit (10 requests). The limit will reset at 12:00 AM. Please consider upgrading your subscription for higher limits and additional features."

### After Reset Time
1. Automatic cache expiration at midnight UTC
2. User can make requests again
3. Counter resets to 0

## Technical Implementation Details

### Error Detection Flow
```
API Response (429)
    ↓
RealReVisionService.handleRateLimitError()
    ↓
Format: "[RATE_LIMIT_EXCEEDED]message|RESET:time"
    ↓
Component error handling
    ↓
Parse marker and time
    ↓
Display localized toast
```

### Message Parsing
```typescript
// Input: "[RATE_LIMIT_EXCEEDED]You have reached...|RESET:3:00 PM"
const parts = error.split('|RESET:');
// parts[0] = "[RATE_LIMIT_EXCEEDED]You have reached..."
// parts[1] = "3:00 PM"

const message = parts[0].replace('[RATE_LIMIT_EXCEEDED]', '');
// message = "You have reached..."

const resetTime = parts[1] || 'later';
// resetTime = "3:00 PM"
```

## Benefits

### For Users
1. **Clear Understanding**: Know exactly what happened and why
2. **Actionable Information**: See when service will be available again
3. **Upgrade Path**: Guided toward subscription options
4. **Localized Experience**: Messages in their preferred language

### For Developers
1. **Consistent Pattern**: Same error handling across all components
2. **Easy Detection**: Marker-based identification of rate limit errors
3. **Maintainable**: Centralized error formatting in service layer
4. **Extensible**: Easy to add more error types with similar patterns

### For Business
1. **Upsell Opportunity**: Clear path to subscription upgrades
2. **User Retention**: Better experience during limit scenarios
3. **Support Reduction**: Self-explanatory error messages
4. **Data Collection**: Track rate limit hits for capacity planning

## Testing Scenarios

### Test Case 1: Exceed Daily Limit
1. Set `DailyRequestLimit: 2` in `appsettings.Development.json`
2. Make 3 translation requests
3. Third request should show rate limit message with reset time
4. Verify message format and reset time display

### Test Case 2: Localization
1. Change language in settings (English → Chinese → Norwegian)
2. Exceed rate limit
3. Verify message displays in correct language

### Test Case 3: Reset Time Accuracy
1. Exceed rate limit
2. Note the reset time shown
3. Wait until reset time
4. Make new request - should succeed

### Test Case 4: Multiple Features
1. Exceed limit with translation
2. Try reply generation - should also show rate limit
3. Try compose - should also show rate limit
4. Verify consistent messaging across features

## Future Enhancements

### 1. Clickable Upgrade Button
```typescript
showToast(ToastType.Error, message, {
  action: {
    label: "Upgrade Now",
    onClick: () => window.open("https://pricing-page.com")
  }
});
```

### 2. Progress Indicator
Show remaining requests before limit:
```typescript
// After each successful request
const remaining = response.headers.get("X-RateLimit-Remaining");
if (remaining && parseInt(remaining) <= 2) {
  showToast(ToastType.Warning, 
    `You have ${remaining} requests remaining today.`);
}
```

### 3. Countdown Timer
Display countdown to reset time:
```typescript
// In component state
const [timeUntilReset, setTimeUntilReset] = useState<string>("");

// Update every minute
useEffect(() => {
  const timer = setInterval(() => {
    const now = new Date();
    const reset = new Date(resetTimestamp);
    const diff = reset.getTime() - now.getTime();
    // Format and display countdown
  }, 60000);
  return () => clearInterval(timer);
}, [resetTimestamp]);
```

### 4. Subscription Tiers Display
Show what different tiers offer:
```typescript
toasts: {
  rateLimitExceededWithTiers: 
    "Daily limit reached ({{current}} requests). " +
    "Upgrade options: Basic (50/day), Pro (200/day), Enterprise (unlimited)."
}
```

## Related Documentation
- [Rate Limiting Implementation](./RATE_LIMITING.md)
- [Rate Limiting Quick Start](../QUICK_START_RATE_LIMITING.md)
- [Configuration Bug Fix](./BUGFIX_RATE_LIMITING_CONFIG.md)

## Changelog

### 2024-01-15 - Initial UX Improvements
- Added `[RATE_LIMIT_EXCEEDED]` marker in error messages
- Enhanced `handleRateLimitError()` with detailed messages
- Updated all 4 feature components with rate limit detection
- Added localized messages for English, Chinese, and Norwegian
- Documented user experience flow and testing scenarios
