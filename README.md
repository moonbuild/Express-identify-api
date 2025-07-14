# Express-identify-api

A robust API that links user contacts across multiple accounts, helping platforms provide personalized experiences to users who use different email addresses and phone numbers.
This project was built as part of the **Bitespeed Backend Challenge**.

## 🚀 Live Demo

**Deployed Endpoint:** `https://express-identify-api.onrender.com/identify` (expects POST method)
Visit [/identify/health](https://express-identify-api.onrender.com/identify/health) Endpoint to awake the [render.com](https://render.com/) server

## 🏗️ Project Arhitecture

The service uses:
- **Node.js + TypeScript** for the backend
- **Express.js** for the REST API
- **NeonDB PostgreSQL** as the database
- **Prisma ORM** for database operations
```
Directory structure:
└── src/
     ├── db.ts # prisma client export
     ├── examples/
     │    ├── merge.js # conflict arising example
     │    └── simple.js # creates new or retrieves existing contact
     ├── router/
     │    └── identify-router.ts # handles logic for /identify/* endpoints
     ├── server.ts # main server file
     ├── services/
     │    └── identify-service.ts # handles core logic for /identify service
     ├── types/
     │    └── identify.ts # all types for /identify service
     └── utils/
          └── validate-identify.ts # validation logic for input
```

## 📊 Prisma Contacts Table

```sql
Contacts {
  id             Int       @id @default(autoincrement())
  phoneNumber    String?
  email          String?
  linkedId       Int?      // References another Primary Contact id
  linkPrecedence String    // "primary" or "secondary"
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  deletedAt      DateTime?
}
```
## 🚀 Installation & Setup

1. #### Clone the repository
   ```bash
   git clone https://github.com/moonbuild/Express-identify-api
   cd Express-identify-api
   ```

2. #### Install dependencies
   ```bash
   npm install
   ```

3. #### Set up environment variables
  - Set `DATABASE_URL={actual_url}` via [neon.com](https://neon.com/) to create free database and tables or your own db.
  - Set `PORT=3000` (or anything u wish)

5. #### Generate Prisma Files
   ```bash
   npx prisma migrate dev --name init # If first time
   npx prisma generate 
   ```

6. #### Run 
   ```bash
   npm run dev 
   ```

## 🔍 Logics

### Scenarios Handled

1. **New User**: Creates a primary contact
2. **Existing User**: Returns existing contact information
3. **New Account of Existing User**: Creates secondary contact linked to primary
4. **Edge Cases**: Handles separate contacts when they share information of new request.

### Examples

#### Scenario 1: New User
```json
Request: { "email": "a1@example.com", "phoneNumber": "111" }
Response: {
  "contact": {
    "primaryContatctId": 1,
    "emails": ["a1@example.com"],
    "phoneNumbers": ["111"],
    "secondaryContactIds": []
  }
}
```

#### Scenario 2: Adding New Information
```json
Request: { "email": "a2@example.com", "phoneNumber": "111" }
Response: {
  "contact": {
    "primaryContatctId": 1,
    "emails": ["a1@example.com", "a2@example.com"],
    "phoneNumbers": ["111"],
    "secondaryContactIds": [2]
  }
}
```

Please experiment with `src/examples/*.js` files, to get to know better. 
Be sure to adjust the url as you see fit