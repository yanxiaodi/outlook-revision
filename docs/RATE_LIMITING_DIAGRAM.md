# Rate Limiting Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Outlook Add-in (Frontend)                          │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │ RealReVisionService                                              │      │
│  │                                                                  │      │
│  │  getHeaders() {                                                  │      │
│  │    email = Office.context.mailbox.userProfile.emailAddress      │      │
│  │    return { "X-User-Email": email, ... }                        │      │
│  │  }                                                               │      │
│  │                                                                  │      │
│  │  translateText() { fetch(url, { headers: getHeaders() }) }      │      │
│  │  generateReply() { fetch(url, { headers: getHeaders() }) }      │      │
│  │  generateCompose() { fetch(url, { headers: getHeaders() }) }    │      │
│  │  analyzeEmail() { fetch(url, { headers: getHeaders() }) }       │      │
│  │  reviseEmail() { fetch(url, { headers: getHeaders() }) }        │      │
│  └──────────────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      │ HTTP POST with X-User-Email header
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ASP.NET Core Web API (Backend)                        │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ 1. RateLimitingMiddleware                                          │    │
│  │    - Extract email from X-User-Email header                        │    │
│  │    - Call IRateLimitService.TryIncrementRequestAsync(email)        │    │
│  │    - If allowed: Continue to controller                            │    │
│  │    - If exceeded: Return 429 with rate limit info                  │    │
│  │    - Add rate limit headers to all responses                       │    │
│  └────────────────────────┬───────────────────────────────────────────┘    │
│                           │                                                 │
│                           │ Check rate limit                                │
│                           │                                                 │
│                           ▼                                                 │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ 2. InMemoryRateLimitService                                        │    │
│  │    ┌──────────────────────────────────────────────────────┐        │    │
│  │    │ MemoryCache                                          │        │    │
│  │    │                                                      │        │    │
│  │    │  Key: "ratelimit:user@example.com:2025-10-15"      │        │    │
│  │    │  Value: 47 (request count)                          │        │    │
│  │    │  Expires: 2025-10-16 00:00:00 UTC                   │        │    │
│  │    │                                                      │        │    │
│  │    │  Key: "ratelimit:another@example.com:2025-10-15"   │        │    │
│  │    │  Value: 92 (request count)                          │        │    │
│  │    │  Expires: 2025-10-16 00:00:00 UTC                   │        │    │
│  │    └──────────────────────────────────────────────────────┘        │    │
│  │                                                                    │    │
│  │    Methods:                                                        │    │
│  │    - TryIncrementRequestAsync(email)                              │    │
│  │      → Check if count < limit                                     │    │
│  │      → Increment counter (thread-safe with semaphore)             │    │
│  │      → Return true/false                                          │    │
│  │    - GetRemainingRequestsAsync(email)                             │    │
│  │      → Return (limit - current count)                             │    │
│  │    - GetResetTimestamp()                                          │    │
│  │      → Return midnight UTC as Unix timestamp                      │    │
│  └────────────────────────┬───────────────────────────────────────────┘    │
│                           │                                                 │
│                           │ If allowed                                      │
│                           │                                                 │
│                           ▼                                                 │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ 3. OutlookController                                               │    │
│  │    - POST /api/Outlook/translate                                   │    │
│  │    - POST /api/Outlook/compose                                     │    │
│  │    - POST /api/Outlook/reply                                       │    │
│  │    - POST /api/Outlook/suggest                                     │    │
│  │    - POST /api/Outlook/revise                                      │    │
│  └────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                         Response Flow                                       │
└─────────────────────────────────────────────────────────────────────────────┘

Success Response (200 OK):
┌────────────────────────────────────────────┐
│ Headers:                                   │
│   X-RateLimit-Limit: 100                   │
│   X-RateLimit-Remaining: 53                │
│   X-RateLimit-Reset: 1729036800            │
│                                            │
│ Body:                                      │
│   { "translatedText": "Hola mundo" }       │
└────────────────────────────────────────────┘

Rate Limit Exceeded (429 Too Many Requests):
┌────────────────────────────────────────────┐
│ Headers:                                   │
│   X-RateLimit-Limit: 100                   │
│   X-RateLimit-Remaining: 0                 │
│   X-RateLimit-Reset: 1729036800            │
│   Retry-After: 3600                        │
│                                            │
│ Body:                                      │
│   {                                        │
│     "type": "...",                         │
│     "title": "Rate Limit Exceeded",        │
│     "status": 429,                         │
│     "detail": "Daily request limit..."     │
│   }                                        │
└────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                         Configuration Files                                 │
└─────────────────────────────────────────────────────────────────────────────┘

appsettings.json (Default):
┌──────────────────────────┐
│ "RateLimiting": {        │
│   "DailyRequestLimit": 100│
│   "Enabled": true        │
│ }                        │
└──────────────────────────┘

appsettings.Development.json:
┌───────────────────────────┐
│ "RateLimiting": {         │
│   "DailyRequestLimit": 1000│
│   "Enabled": false        │  ← Disabled for easier testing
│ }                         │
└───────────────────────────┘

appsettings.Production.json:
┌──────────────────────────┐
│ "RateLimiting": {        │
│   "DailyRequestLimit": 100│
│   "Enabled": true        │  ← Enforced in production
│ }                        │
└──────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                         Time-based Counter Reset                            │
└─────────────────────────────────────────────────────────────────────────────┘

Day 1 (2025-10-15):
00:00 UTC ─────────────────────────────────────────────────────── 23:59 UTC
│                                                                          │
│  user@example.com: 0 → 1 → 2 → ... → 47 → ... → 100 → ❌ (limit reached)│
│  another@example.com: 0 → 1 → 2 → ... → 15                              │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                        Automatic reset at midnight
                                    │
                                    ▼
Day 2 (2025-10-16):
00:00 UTC ─────────────────────────────────────────────────────── 23:59 UTC
│                                                                          │
│  user@example.com: 0 → 1 → 2 → ... (fresh start)                       │
│  another@example.com: 0 → 1 → 2 → ...                                  │
└──────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                         Thread Safety                                       │
└─────────────────────────────────────────────────────────────────────────────┘

Multiple concurrent requests from same user:

Request 1 ──┐
Request 2 ──┼─→ SemaphoreSlim (1,1) ─→ [Get] → [Check] → [Increment] → [Set]
Request 3 ──┘       Only 1 thread           Count = 47    < 100?     Count = 48
                    at a time               from cache    YES!       to cache

This ensures accurate counting even under high concurrent load.
