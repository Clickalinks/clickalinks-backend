# Security Audit Item #6: Admin-Only Delete/Update Permissions

## Status: ✅ Implemented

### Security Principle
Only administrators can delete or update purchase data. All delete/update operations are protected by admin authentication (JWT token with `admin: true`).

---

## ✅ Implementation Summary

### **1. Promo Code Operations (Already Protected)**
All promo code management operations are admin-protected:

- ✅ **Create Promo Code**: `POST /api/promo-code/create` - Protected with `verifyAdminToken`
- ✅ **Delete Promo Code**: `DELETE /api/promo-code/:id` - Protected with `verifyAdminToken`
- ✅ **Bulk Delete Promo Codes**: `POST /api/promo-code/bulk-delete` - Protected with `verifyAdminToken`
- ✅ **List All Promo Codes**: `GET /api/promo-code/list` - Protected with `verifyAdminToken`

### **2. Purchase Operations (Now Protected)**

#### **DELETE /api/purchases/:purchaseId** (Admin Only)
- **Purpose**: Delete a purchase from the system
- **Protection**: `verifyAdminToken` middleware
- **Use Cases**:
  - User requests deletion (e.g., refund, cancellation)
  - Administrative cleanup
  - Removing invalid/duplicate purchases
- **Features**:
  - Verifies purchase exists before deletion
  - Logs deletion details for audit trail
  - Returns confirmation with deleted purchase details

**Example Request:**
```bash
DELETE /api/purchases/purchase-123
Authorization: Bearer <admin-jwt-token>
```

**Example Response:**
```json
{
  "success": true,
  "message": "Purchase deleted successfully",
  "purchaseId": "purchase-123",
  "deletedPurchase": {
    "businessName": "Example Business",
    "squareNumber": 5,
    "contactEmail": "contact@example.com"
  }
}
```

#### **PUT /api/purchases/:purchaseId** (Admin Only)
- **Purpose**: Update purchase data (e.g., fix typo in URL, update email)
- **Protection**: `verifyAdminToken` middleware
- **Use Cases**:
  - User requests changes (e.g., wrong URL, wrong email)
  - Administrative corrections
  - Status updates (active, expired, cancelled)
- **Updatable Fields**:
  - `businessName` - Business name
  - `contactEmail` - Contact email address
  - `website` - Website URL
  - `dealLink` - Deal link URL
  - `logoData` - Logo image URL or data URL
  - `status` - Purchase status (active, expired, cancelled)
  - `duration` - Campaign duration (recalculates endDate automatically)
- **Features**:
  - Input validation with express-validator
  - Only updates provided fields (partial updates supported)
  - Validates logoData format (URL or data URL)
  - Automatically syncs `website` and `dealLink` fields
  - Recalculates `endDate` if `duration` is updated

**Example Request:**
```bash
PUT /api/purchases/purchase-123
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "website": "https://example.com/corrected-url",
  "contactEmail": "corrected@example.com"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Purchase updated successfully",
  "purchaseId": "purchase-123",
  "updatedFields": ["website", "dealLink", "contactEmail"]
}
```

### **3. Firestore Security Rules**
- ✅ **Client-side writes blocked**: `allow write: if false;`
- ✅ **All writes must go through backend API**: Uses Firebase Admin SDK (bypasses client-side rules)
- ✅ **Read access**: Public read access for displaying ads (write operations are blocked)

---

## 🔐 Security Features

### **Admin Authentication**
- All delete/update endpoints require `verifyAdminToken` middleware
- Token must have `admin: true` in the JWT payload
- Tokens are validated on every request
- Invalid or missing tokens return `401 Unauthorized`

### **Input Validation**
- Express-validator used for all input validation
- Email format validation
- URL length limits (max 500 characters)
- Status enum validation (active, expired, cancelled)
- Duration range validation (1-365 days)

### **Audit Trail**
- All delete/update operations are logged with:
  - Purchase ID
  - Business name
  - Square number
  - Contact email
  - Timestamp (automatic via Firestore serverTimestamp)

### **Error Handling**
- Comprehensive error handling for all operations
- Descriptive error messages
- Proper HTTP status codes (400, 401, 404, 500)

---

## 📋 Admin Workflow

### **When a User Requests Changes:**
1. User emails `ads@clickalinks.com` with:
   - Transaction ID
   - Business name
   - What needs to be changed
2. Admin logs into admin portal at `/portal`
3. Admin uses appropriate endpoint to update/delete:
   - Update: `PUT /api/purchases/:purchaseId`
   - Delete: `DELETE /api/purchases/:purchaseId`
4. System logs the change for audit trail

### **Rate Limiting**
- All endpoints protected with `generalRateLimit` middleware
- Prevents abuse and DoS attacks

---

## ✅ Verification Checklist

- [x] Promo code deletion is admin-protected
- [x] Promo code creation is admin-protected
- [x] Purchase deletion is admin-protected
- [x] Purchase updates are admin-protected
- [x] All endpoints use `verifyAdminToken` middleware
- [x] Firestore rules block public writes
- [x] Input validation on all endpoints
- [x] Audit logging for all operations
- [x] Proper error handling

---

*Last Updated: January 2026*

