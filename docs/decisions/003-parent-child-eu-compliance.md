# ADR-003: Parent-Child Account Management for EU Compliance

## Status
Accepted

## Context
EU regulations (GDPR/COPPA) require special handling of minors' data:
- Children under 13 cannot create accounts independently
- Parental consent and oversight required
- Both parents may need access to child's account

## Decision
Implement a parent-child account structure where:
- Users under 13 must register through parent account
- Users 13+ can register independently but allow parent access
- Support multiple parents per child
- Parents have full visibility into child's data

## Consequences

### Positive
- **Legal Compliance**: Meets EU/GDPR requirements
- **Parent Peace of Mind**: Full transparency for parents
- **Flexibility**: Supports various family structures
- **Age-Appropriate**: Different flows based on age

### Negative
- **Complex Registration**: More steps for families
- **Account Management**: More complex user relationships
- **Privacy Balance**: Need to respect teen privacy while ensuring safety

## Implementation
- `parent_child_relations` table linking accounts
- Age verification during registration
- Parent invitation system for existing child accounts
- Account switching UI for parents