# Security Audit Item #5: User Data Modification Policy

## Status: ✅ Implemented (No User Accounts)

### Context
ClickaLinks does **not** have a user account system or login functionality. Users make purchases directly without creating accounts.

### Policy
**Users cannot modify their own purchase data directly through the system.**

### How Users Can Request Changes
If a user needs to modify their purchase (e.g., fix a typo in URL, update email address, change logo), they should:

1. **Contact Support**: Email `ads@clickalinks.com`
2. **Include Details**: Provide their purchase information:
   - Transaction ID (found in their purchase confirmation email)
   - Business name
   - Square number
   - What needs to be changed
3. **Admin Review**: An admin will review the request and make the necessary changes manually via the admin portal

### Rationale
- **No User Accounts**: Since there's no authentication system, there's no way to verify ownership
- **Security**: Prevents unauthorized modifications to purchase data
- **Control**: Ensures all changes are reviewed and approved by admin
- **Audit Trail**: All changes go through admin portal, maintaining a clear audit trail

### Implementation
- **Removed**: User ownership verification endpoints (`GET /api/purchases/:purchaseId`, `PUT /api/purchases/:purchaseId`, `GET /api/purchases/user/:email`)
- **Removed**: Ownership verification middleware (`verifyPurchaseOwnership.js`)
- **Note**: All purchase modifications must go through admin portal after user contacts support

### Admin Actions
Admins can modify purchase data through:
- Admin portal at `/portal` (requires admin authentication with MFA)
- Direct Firestore access for emergency changes
- Backend scripts for bulk operations

### Contact Information
**Support Email**: `ads@clickalinks.com`

---

*Last Updated: January 2026*

