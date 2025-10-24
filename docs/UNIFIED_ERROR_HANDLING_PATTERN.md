# Unified Error Handling Pattern

## Overview
This document describes the unified error handling pattern implemented across all React components in the Outlook ReVision add-in. The pattern ensures consistent, predictable error handling and user feedback.

## Inconsistencies Found and Fixed

### Before Unification

#### Issues Identified:
1. **Unused Variables**: All components parsed `resetTime` but never used it
2. **Inconsistent Console Logging**: 
   - Some components logged errors before showing toasts
   - Some logged after showing toasts
   - Revise.tsx was missing console.error in if blocks
3. **Network Error Detection**: 
   - Translate/Reply/Compose checked in if blocks
   - Revise only checked in catch blocks
4. **Code Duplication**: Repeated parsing logic across all components
5. **Inconsistent Error Messages**: Different approaches in different components

### Component-Specific Issues:

**Translate.tsx:**
- ✅ Had rate limit detection
- ✅ Had network error check
- ⚠️ Unused `resetTime` variable
- ⚠️ `console.error` after `showToast` in catch block

**Reply.tsx:**
- ✅ Had rate limit detection
- ✅ Had network error check
- ⚠️ Unused `resetTime` variable
- ⚠️ Different console.error ordering

**Compose.tsx:**
- ✅ Had rate limit detection
- ✅ Had network error check
- ⚠️ Unused `resetTime` variable
- ⚠️ `console.error` before `showToast` in catch block (inconsistent)

**Revise.tsx:**
- ✅ Had rate limit detection
- ❌ Missing network error check in if blocks
- ❌ Missing console.error in if blocks
- ⚠️ Unused `resetTime` variable
- ⚠️ Overly complex catch block logic

## Unified Pattern

### Standard Error Handling Structure

```typescript
if (!result.success) {
  // 1. ALWAYS log errors first for debugging
  console.error("Operation failed:", result.error);
  
  // 2. Check for rate limit errors (highest priority)
  if (result.error?.includes('[RATE_LIMIT_EXCEEDED]')) {
    const message = result.error.split('|RESET:')[0].replace('[RATE_LIMIT_EXCEEDED]', '');
    showToast(ToastType.Error, message);
    return;
  }
  
  // 3. Check for network errors (second priority)
  const isNetworkError = result.error?.toLowerCase().includes('network') || 
                        result.error?.toLowerCase().includes('fetch');
  showToast(ToastType.Error, isNetworkError ? "common:toasts.networkError" : "common:toasts.operationFailed");
  return;
}

// Success case
try {
  // ... operation logic ...
} catch (err) {
  // ALWAYS log errors first
  console.error("Operation error:", err);
  showToast(ToastType.Error, "common:toasts.unexpectedError");
}
```

### Key Principles

#### 1. Logging First
Always call `console.error()` **BEFORE** any user-facing actions:
```typescript
console.error("Operation failed:", result.error);
// Then show toast
```

**Why:** Ensures errors are captured even if subsequent code throws

#### 2. Simplified Parsing
Remove unused variables, use inline parsing:
```typescript
// Before (wasteful):
const parts = result.error.split('|RESET:');
const message = parts[0].replace('[RATE_LIMIT_EXCEEDED]', '');
const resetTime = parts[1] || 'later'; // NEVER USED

// After (efficient):
const message = result.error.split('|RESET:')[0].replace('[RATE_LIMIT_EXCEEDED]', '');
```

#### 3. Consistent Network Detection
Always check for network errors in the same if block as other errors:
```typescript
// Check immediately after rate limit check
const isNetworkError = result.error?.toLowerCase().includes('network') || 
                      result.error?.toLowerCase().includes('fetch');
```

#### 4. Early Return Pattern
Use early returns to avoid nested if-else:
```typescript
if (isRateLimitError) {
  showToast(...);
  return; // Exit early
}
// Continue with other checks
```

#### 5. Simplified Catch Blocks
Catch blocks should be simple and consistent:
```typescript
catch (err) {
  console.error("Operation error:", err);
  showToast(ToastType.Error, "common:toasts.unexpectedError");
}
```

## Implementation by Component

### Translate.tsx
```typescript
if (!translateResult.success) {
  console.error("Translation failed:", translateResult.error);
  
  // Rate limit check
  if (translateResult.error?.includes('[RATE_LIMIT_EXCEEDED]')) {
    const message = translateResult.error.split('|RESET:')[0].replace('[RATE_LIMIT_EXCEEDED]', '');
    showToast(ToastType.Error, message);
    return;
  }
  
  // Network error check
  const isNetworkError = translateResult.error?.toLowerCase().includes('network') || 
                        translateResult.error?.toLowerCase().includes('fetch');
  showToast(ToastType.Error, isNetworkError ? "common:toasts.networkError" : "common:toasts.translationFailed");
  return;
}
```

### Reply.tsx
```typescript
if (!replyResult.success) {
  console.error("Reply generation failed:", replyResult.error);
  
  // Rate limit check
  if (replyResult.error?.includes('[RATE_LIMIT_EXCEEDED]')) {
    const message = replyResult.error.split('|RESET:')[0].replace('[RATE_LIMIT_EXCEEDED]', '');
    showToast(ToastType.Error, message);
    return;
  }
  
  // Network error check
  const isNetworkError = replyResult.error?.toLowerCase().includes('network') || 
                        replyResult.error?.toLowerCase().includes('fetch');
  showToast(ToastType.Error, isNetworkError ? "common:toasts.networkError" : "common:toasts.replyFailed");
  return;
}
```

### Compose.tsx
```typescript
if (!result.success || !result.data) {
  console.error("Compose generation failed:", result.error);
  
  // Rate limit check
  if (result.error?.includes('[RATE_LIMIT_EXCEEDED]')) {
    const message = result.error.split('|RESET:')[0].replace('[RATE_LIMIT_EXCEEDED]', '');
    showToast(ToastType.Error, message);
    return;
  }
  
  // Network error check
  const isNetworkError = result.error?.toLowerCase().includes('network') || 
                        result.error?.toLowerCase().includes('fetch');
  showToast(ToastType.Error, isNetworkError ? "common:toasts.networkError" : "common:toasts.composeFailed");
  return;
}
```

### Revise.tsx - Analysis
```typescript
} else {
  console.error("Analysis failed:", result.error);
  
  // Rate limit check
  if (result.error?.includes('[RATE_LIMIT_EXCEEDED]')) {
    const message = result.error.split('|RESET:')[0].replace('[RATE_LIMIT_EXCEEDED]', '');
    setError(message);
    showToast(ToastType.Error, message);
    return;
  }
  
  // Network error check
  const isNetworkError = result.error?.toLowerCase().includes('network') || 
                        result.error?.toLowerCase().includes('fetch');
  const errorMessage = result.error || t("common.unknownError");
  setError(errorMessage);
  showToast(ToastType.Error, isNetworkError ? t("common:toasts.networkError") : t("common:toasts.analysisError"), {
    body: errorMessage,
  });
}
```

### Revise.tsx - Revision
```typescript
} else {
  console.error("Revision failed:", result.error);
  
  // Rate limit check
  if (result.error?.includes('[RATE_LIMIT_EXCEEDED]')) {
    const message = result.error.split('|RESET:')[0].replace('[RATE_LIMIT_EXCEEDED]', '');
    setError(message);
    showToast(ToastType.Error, message);
    return;
  }
  
  // Network error check
  const isNetworkError = result.error?.toLowerCase().includes('network') || 
                        result.error?.toLowerCase().includes('fetch');
  const errorMessage = result.error || t("common.unknownError");
  setError(errorMessage);
  showToast(ToastType.Error, isNetworkError ? t("common:toasts.networkError") : t("common:toasts.revisionError"), {
    body: errorMessage,
  });
}
```

## Benefits of Unification

### 1. Maintainability
- **Single Pattern**: All components follow the same structure
- **Easy Updates**: Changes can be applied uniformly
- **Code Reviews**: Easier to spot deviations from the pattern

### 2. Debugging
- **Consistent Logging**: Errors always logged before actions
- **Predictable Flow**: Same order of checks in every component
- **Complete Stack Traces**: Logging before any throws preserves context

### 3. Performance
- **No Unused Variables**: Removed wasteful parsing
- **Early Returns**: Avoid unnecessary checks
- **Inline Operations**: Reduced variable allocations

### 4. User Experience
- **Consistent Messages**: Users see the same pattern across features
- **Priority Ordering**: Rate limits > Network > Generic errors
- **Clear Feedback**: Always get an error message, never silent failures

### 5. Code Quality
- **Less Duplication**: Removed repeated parsing logic
- **Cleaner Code**: Simpler, more readable error handling
- **Type Safety**: Consistent use of optional chaining

## Error Priority Hierarchy

The unified pattern enforces this priority:

```
1. Rate Limit Errors (429 with marker)
   ↓ (if not rate limit)
2. Network Errors (fetch/network in message)
   ↓ (if not network)
3. Operation-Specific Errors (translation/reply/compose/analysis/revision)
   ↓ (if exception thrown)
4. Unexpected Errors (catch block)
```

## Special Considerations

### Revise.tsx Differences
Revise.tsx maintains some differences due to its architecture:

1. **Uses Translation Function**: `t("common:toasts.networkError")` instead of `"common:toasts.networkError"`
2. **Has setError()**: Updates component state for error display
3. **Toast Body Parameter**: Passes detailed error in body

These differences are **intentional** and don't violate the unified pattern.

### Why Not Extract to Utility Function?

**Considered but rejected** for these reasons:

1. **Component-Specific Context**: Different toast messages, state updates
2. **Minimal Code**: Only 10-15 lines per component
3. **Flexibility**: Easier to customize per-component if needed
4. **Readability**: Inline code is clearer than abstraction here
5. **Performance**: No function call overhead

## Testing the Pattern

### Unit Test Template
```typescript
describe('Component Error Handling', () => {
  it('should handle rate limit errors', async () => {
    const errorMessage = '[RATE_LIMIT_EXCEEDED]Rate limit exceeded|RESET:12:00 AM';
    mockService.operation.mockResolvedValue({ success: false, error: errorMessage });
    
    await userEvent.click(operationButton);
    
    expect(console.error).toHaveBeenCalledWith('Operation failed:', errorMessage);
    expect(showToast).toHaveBeenCalledWith(ToastType.Error, expect.stringContaining('Rate limit exceeded'));
  });
  
  it('should handle network errors', async () => {
    mockService.operation.mockResolvedValue({ success: false, error: 'Network error' });
    
    await userEvent.click(operationButton);
    
    expect(showToast).toHaveBeenCalledWith(ToastType.Error, 'common:toasts.networkError');
  });
  
  it('should handle generic errors', async () => {
    mockService.operation.mockResolvedValue({ success: false, error: 'Unknown error' });
    
    await userEvent.click(operationButton);
    
    expect(showToast).toHaveBeenCalledWith(ToastType.Error, 'common:toasts.operationFailed');
  });
});
```

### Integration Test Checklist
- [ ] Rate limit error shows correct message
- [ ] Network error shows network toast
- [ ] Generic error shows operation-specific toast
- [ ] Console.error called before toast
- [ ] Early return prevents further execution
- [ ] Catch block handles exceptions

## Future Improvements

### 1. Error Codes
Add structured error codes instead of string matching:
```typescript
if (result.errorCode === ErrorCode.RATE_LIMIT_EXCEEDED) {
  // Handle rate limit
}
```

### 2. Error Analytics
Track error patterns for monitoring:
```typescript
console.error("Operation failed:", result.error);
analytics.trackError('translation', result.error, result.errorCode);
```

### 3. Retry Logic
Add automatic retry for transient errors:
```typescript
if (isNetworkError && retryCount < MAX_RETRIES) {
  await delay(RETRY_DELAY);
  return retryOperation();
}
```

### 4. Error Recovery
Provide recovery actions:
```typescript
showToast(ToastType.Error, message, {
  action: { label: "Retry", onClick: () => retryOperation() }
});
```

## Related Documentation
- [Rate Limiting UX Improvements](./RATE_LIMITING_UX_IMPROVEMENTS.md)
- [Rate Limiting Implementation](./RATE_LIMITING.md)
- [Error Handling Best Practices](./ERROR_HANDLING_BEST_PRACTICES.md)

## Changelog

### 2024-10-16 - Unified Error Handling Pattern
- Removed unused `resetTime` variables across all components
- Standardized console.error placement (always first)
- Added network error detection to Revise.tsx if blocks
- Unified parsing logic (inline, no intermediate variables)
- Simplified catch blocks across all components
- Documented standard pattern and best practices

---

**Status**: ✅ Complete and Consistent
**Impact**: High - Improved code quality, maintainability, and debugging
**Components Updated**: 5 (Translate.tsx, Reply.tsx, Compose.tsx, Revise.tsx x2)
