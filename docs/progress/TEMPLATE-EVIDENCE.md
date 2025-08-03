# [Feature Name] - Evidence Documentation

## User Validation Evidence

### Workflow Testing Results
| Test Scenario | Expected Result | Actual Result | Status | Evidence |
|---------------|-----------------|---------------|---------|----------|
| [User action] | [What should happen] | [What actually happened] | ✅/❌ | [Screenshot file] |
| [User action] | [What should happen] | [What actually happened] | ✅/❌ | [Screenshot file] |

### Data Persistence Verification
- **Create Test**: [Evidence that data saves correctly]
- **Read Test**: [Evidence that data loads correctly]  
- **Update Test**: [Evidence that changes persist]
- **Delete Test**: [Evidence that deletions work]
- **Session Test**: [Evidence that data survives logout/login]

## Technical Evidence

### Database Verification
**Screenshot Required**: `screenshots/database-verification.png`
- **Expected**: [What should be in the database]
- **Analysis**: [What the screenshot shows]
- **Validation**: [Confirmation that data is correct]

### API Response Evidence  
**Screenshot Required**: `screenshots/api-responses.png`
- **Endpoint**: [API endpoint tested]
- **Request**: [Request parameters]
- **Response**: [Response data structure]
- **Status**: [HTTP status and timing]

### User Interface Evidence
**Screenshot Required**: `screenshots/ui-functionality.png`
- **Before State**: [UI before user interaction]
- **After State**: [UI after user interaction]
- **Key Elements**: [Important UI components shown]
- **User Experience**: [How the interface behaves]

## Performance Evidence

### Response Times
**Screenshot Required**: `screenshots/performance-metrics.png`
- **Load Time**: [Page/feature load performance]
- **API Latency**: [Backend response times]
- **User Perceived Performance**: [How fast it feels to users]

### Resource Usage
- **Memory**: [Memory consumption changes]
- **CPU**: [Processing requirements]
- **Network**: [Data transfer requirements]

## Error Handling Evidence

### Error Scenarios Tested
**Screenshot Required**: `screenshots/error-handling.png`
- **Network Failure**: [How system handles connectivity issues]
- **Invalid Input**: [How system validates and responds to bad data]
- **Authentication Failure**: [How system handles auth issues]
- **Server Error**: [How system handles backend failures]

## Browser Compatibility

### Tested Environments
| Browser | Version | Status | Issues | Evidence |
|---------|---------|---------|---------|----------|
| Chrome | [version] | ✅/❌ | [Any issues found] | [Screenshot if needed] |
| Firefox | [version] | ✅/❌ | [Any issues found] | [Screenshot if needed] |
| Safari | [version] | ✅/❌ | [Any issues found] | [Screenshot if needed] |

## Mobile Responsiveness

### Mobile Testing Results
**Screenshot Required**: `screenshots/mobile-responsive.png`
- **Device**: [Phone/tablet used for testing]
- **Screen Size**: [Resolution tested]
- **Usability**: [How well it works on mobile]
- **Issues**: [Any mobile-specific problems]

## Security Testing

### Authentication Testing
- **Login Process**: [Evidence that auth works correctly]
- **Session Management**: [Evidence that sessions are secure]
- **Authorization**: [Evidence that permissions work]

### Data Protection Testing
- **Input Sanitization**: [Evidence that dangerous input is handled]
- **Output Encoding**: [Evidence that XSS is prevented]
- **Data Encryption**: [Evidence that sensitive data is protected]

## Accessibility Testing

### Screen Reader Compatibility
- **Navigation**: [How well screen readers can navigate]
- **Content**: [How well content is read aloud]
- **Forms**: [How well forms work with assistive technology]

### Keyboard Navigation
- **Tab Order**: [Evidence that tab order is logical]
- **Keyboard Shortcuts**: [Evidence that shortcuts work]
- **Focus Management**: [Evidence that focus is handled properly]

## Integration Testing

### Third-Party Services
- **Google OAuth**: [Evidence that authentication works]
- **Database**: [Evidence that database operations work]
- **Railway Deployment**: [Evidence that production deployment works]

### API Integration
- **tRPC Endpoints**: [Evidence that all API calls work]
- **Error Propagation**: [Evidence that errors are handled across layers]
- **Data Consistency**: [Evidence that data stays consistent across operations]

## Screenshots Checklist

### Required Screenshots
- [ ] `database-verification.png` - Database showing saved data
- [ ] `api-responses.png` - Network tab showing successful API calls  
- [ ] `ui-functionality.png` - User interface with working features
- [ ] `performance-metrics.png` - Performance data from browser tools
- [ ] `error-handling.png` - Error states and handling
- [ ] `mobile-responsive.png` - Mobile device testing

### Optional Screenshots  
- [ ] `browser-compatibility.png` - Different browsers if issues found
- [ ] `accessibility-testing.png` - Accessibility tools if specific testing done
- [ ] `security-testing.png` - Security tools if specific testing done

## Evidence Analysis

### Key Findings
- **Strengths**: [What works exceptionally well]
- **Weaknesses**: [What could be improved]  
- **Surprises**: [Unexpected behaviors discovered]

### User Feedback
- **Positive**: [What users liked about the feature]
- **Negative**: [What users found problematic]
- **Suggestions**: [User suggestions for improvement]

---

**Evidence Collection Date**: [YYYY-MM-DD]  
**Testing Environment**: [Local/Production/Both]  
**Primary Tester**: [User name]