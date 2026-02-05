# ATC Booking System API Documentation

Base URL: `https://atc-bookingsmike-production.up.railway.app/api`

## Authentication

The API supports three authentication levels:

| Level | Method | Access |
|-------|--------|--------|
| **Public** | None | Read-only access to bookings |
| **Organization** | Bearer Token | Full CRUD on own organization's bookings |
| **Admin** | Secret Key Cookie | Manage API keys and organization members |

### Organization Authentication (Bearer Token)

Include your API key in the `Authorization` header:

```
Authorization: Bearer YOUR_API_KEY
```

---

## Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": ["Validation error messages"]
  }
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful delete) |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Server Error |

---

## Public Endpoints

These endpoints require no authentication.

### List Bookings

Retrieve all bookings with optional filters.

```
GET /bookings
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `callsign` | string | Filter by callsign (partial match) |
| `division` | string | Filter by division (e.g., "VATUSA") |
| `subdivision` | string | Filter by subdivision (e.g., "ZLA") |
| `type` | string | Filter by type: `booking`, `event`, `exam`, `training` |
| `startDate` | ISO 8601 | Bookings starting after this date |
| `endDate` | ISO 8601 | Bookings ending before this date |
| `order` | string | `current` (active now), `past`, or `future` |

#### Example Request

```bash
curl "https://atc-bookingsmike-production.up.railway.app/api/bookings?division=VATUSA&order=current"
```

#### Example Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "cid": "1234567",
      "callsign": "KLAX_TWR",
      "type": "booking",
      "start": "2024-01-15T14:00:00.000Z",
      "end": "2024-01-15T16:00:00.000Z",
      "division": "VATUSA",
      "subdivision": "ZLA",
      "createdAt": "2024-01-10T10:00:00.000Z",
      "updatedAt": "2024-01-10T10:00:00.000Z"
    }
  ]
}
```

---

## Organization Endpoints

These endpoints require Bearer token authentication. Organizations can only manage their own bookings.

### Create Booking

```
POST /bookings
```

#### Headers

```
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `cid` | string | Yes | Controller's VATSIM CID |
| `callsign` | string | Yes | Position callsign (must end with valid suffix) |
| `type` | string | No | `booking` (default), `event`, `exam`, `training` |
| `start` | ISO 8601 | Yes | Booking start time |
| `end` | ISO 8601 | Yes | Booking end time |
| `division` | string | Yes | Division code (e.g., "VATUSA") |
| `subdivision` | string | No | Subdivision code (e.g., "ZLA") |

#### Valid Callsign Suffixes

- `_DEL` - Delivery
- `_GND` - Ground
- `_TWR` - Tower
- `_APP` - Approach
- `_DEP` - Departure
- `_CTR` - Center/Enroute
- `_FSS` - Flight Service Station

#### Example Request

```bash
curl -X POST "https://atc-bookingsmike-production.up.railway.app/api/bookings" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "cid": "1234567",
    "callsign": "KLAX_TWR",
    "type": "booking",
    "start": "2024-01-15T14:00:00.000Z",
    "end": "2024-01-15T16:00:00.000Z",
    "division": "VATUSA",
    "subdivision": "ZLA"
  }'
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "cid": "1234567",
    "callsign": "KLAX_TWR",
    "type": "booking",
    "start": "2024-01-15T14:00:00.000Z",
    "end": "2024-01-15T16:00:00.000Z",
    "division": "VATUSA",
    "subdivision": "ZLA",
    "apiKeyId": 1,
    "createdAt": "2024-01-10T10:00:00.000Z",
    "updatedAt": "2024-01-10T10:00:00.000Z"
  },
  "message": "Resource created successfully"
}
```

---

### Get Booking by ID

```
GET /bookings/:id
```

#### Example Request

```bash
curl "https://atc-bookingsmike-production.up.railway.app/api/bookings/1" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

### Update Booking

Update a booking owned by your organization.

```
PUT /bookings/:id
```

#### Request Body

All fields are optional. Only include fields you want to update.

```json
{
  "callsign": "KLAX_GND",
  "end": "2024-01-15T18:00:00.000Z"
}
```

#### Example Request

```bash
curl -X PUT "https://atc-bookingsmike-production.up.railway.app/api/bookings/1" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "end": "2024-01-15T18:00:00.000Z"
  }'
```

---

### Delete Booking

Delete a booking owned by your organization.

```
DELETE /bookings/:id
```

#### Example Request

```bash
curl -X DELETE "https://atc-bookingsmike-production.up.railway.app/api/bookings/1" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Response

Returns `204 No Content` on success.

---

### Get My Organization

Get information about your organization.

```
GET /org/me
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Los Angeles ARTCC",
    "division": "VATUSA",
    "subdivision": "ZLA",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Get My Bookings

Get all bookings for your organization.

```
GET /org/bookings
```

#### Example Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "cid": "1234567",
      "callsign": "KLAX_TWR",
      "type": "booking",
      "start": "2024-01-15T14:00:00.000Z",
      "end": "2024-01-15T16:00:00.000Z",
      "division": "VATUSA",
      "subdivision": "ZLA"
    }
  ]
}
```

---

## VATSIM OAuth Endpoints

These endpoints are used by the web-based organization portal for VATSIM OAuth authentication.

### Initiate OAuth Flow

Redirects to VATSIM login page.

```
GET /oauth/vatsim
```

### OAuth Callback

Handles the OAuth callback from VATSIM. Not called directly.

```
GET /oauth/vatsim/callback
```

### Get Session

Get current session information (requires session cookie).

```
GET /oauth/session
```

### Switch Organization

Switch to a different organization (for users with multiple org memberships).

```
POST /oauth/session/org
```

#### Request Body

```json
{
  "orgId": 1
}
```

### Logout

End the current session.

```
POST /oauth/logout
```

---

## Booking Types

| Type | Description | Color Code |
|------|-------------|------------|
| `booking` | Standard ATC booking | Blue |
| `event` | Special event coverage | Red |
| `exam` | Controller examination | Orange |
| `training` | Training session | Purple |

---

## Rate Limits

Currently no rate limits are enforced. Please use the API responsibly.

---

## Errors

### Validation Errors (422)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "callsign": ["Callsign must end with: _DEL, _GND, _TWR, _APP, _DEP, _CTR, or _FSS"],
    "start": ["Invalid start date format"]
  }
}
```

### Unauthorized (401)

```json
{
  "success": false,
  "message": "Invalid or missing API key"
}
```

### Forbidden - Wrong Organization (400)

```json
{
  "success": false,
  "message": "You can only modify bookings from your own organization"
}
```

### Overlap Error (400)

```json
{
  "success": false,
  "message": "Booking overlaps with existing booking for this callsign"
}
```

---

## Examples

### Get All Current Bookings

```bash
curl "https://atc-bookingsmike-production.up.railway.app/api/bookings?order=current"
```

### Get Bookings for a Specific Division

```bash
curl "https://atc-bookingsmike-production.up.railway.app/api/bookings?division=VATUSA"
```

### Get Upcoming Events

```bash
curl "https://atc-bookingsmike-production.up.railway.app/api/bookings?type=event&order=future"
```

### Create a Training Session

```bash
curl -X POST "https://atc-bookingsmike-production.up.railway.app/api/bookings" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "cid": "1234567",
    "callsign": "KLAX_S_TWR",
    "type": "training",
    "start": "2024-01-20T18:00:00.000Z",
    "end": "2024-01-20T20:00:00.000Z",
    "division": "VATUSA",
    "subdivision": "ZLA"
  }'
```
