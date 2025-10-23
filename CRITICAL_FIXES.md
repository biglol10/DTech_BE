# Critical Fixes - Code Examples & Solutions

## ISSUE 1: SQL INJECTION VULNERABILITIES

### Location 1: authController.ts (Line 27)
**File:** `/home/user/DTech_BE/src/middleware/auth.ts`

#### Current Code (VULNERABLE)
```typescript
const sql = `SELECT USER_UID, USER_ID, USER_NM, TEAM_CD, USER_TITLE,
             USER_ADMIN_YN, USER_IMG_URL FROM USER WHERE USER_ID = '${decoded.id}'`;
const { status: isQuerySuccess, queryResult: selectedUser } = await queryExecutorResult(sql);
```

#### Fixed Code
```typescript
const sql = `SELECT USER_UID, USER_ID, USER_NM, TEAM_CD, USER_TITLE,
             USER_ADMIN_YN, USER_IMG_URL FROM USER WHERE USER_ID = ?`;
const { status: isQuerySuccess, queryResult: selectedUser } = await queryExecutorResult2(sql, [decoded.id]);
```

---

### Location 2: dashboardController.ts (Line 42)
**File:** `/home/user/DTech_BE/src/controllers/dashboardController.ts`

#### Current Code (VULNERABLE)
```typescript
if (filterName) {
  userSkillFilterSql += ` AND T1.USER_NM LIKE '%${filterName}%'`;
}
```

#### Fixed Code
```typescript
const paramArr = [];
let userSkillFilterSql = `SELECT T1.USER_UID, ... FROM USER AS T1 ... WHERE 1 = 1`;

if (filterSkill !== '전체') {
  userSkillFilterSql += ` AND EXISTS (SELECT * FROM USER_TECH AS T4 INNER JOIN TECH AS T5
                        ON T4.TECH_CD = T5.TECH_CD AND T5.TECH_NM = ?
                        AND T1.USER_UID = T4.USER_UID)`;
  paramArr.push(filterSkill);
}

if (filterName) {
  userSkillFilterSql += ` AND T1.USER_NM LIKE ?`;
  paramArr.push(`%${filterName}%`);
}

const filterResult = await queryExecutorResult2(userSkillFilterSql, paramArr);
```

---

### Location 3: chatController.ts (Line 110)
**File:** `/home/user/DTech_BE/src/controllers/chatController.ts`

#### Current Code (VULNERABLE)
```typescript
const insertAction = userParticipants.map((singleUser: { USER_UID: string; USER_ID: string }) => {
  const groupMemberSql = `INSERT INTO GROUP_MEMBER VALUES ('${chat_uuid}', '${singleUser.USER_UID}', SYSDATE(), 0);`;
  queryExecutorResult2(groupMemberSql, []);
});
```

#### Fixed Code
```typescript
const insertActions = userParticipants.map((singleUser: { USER_UID: string; USER_ID: string }) => {
  const groupMemberSql = `INSERT INTO GROUP_MEMBER VALUES (?, ?, SYSDATE(), 0)`;
  return queryExecutorResult2(groupMemberSql, [chat_uuid, singleUser.USER_UID]);
});

await Promise.all(insertActions);  // Wait for all inserts to complete
```

---

### Location 4: chatController.ts (Line 137)
**File:** `/home/user/DTech_BE/src/controllers/chatController.ts`

#### Current Code (VULNERABLE)
```typescript
const sql = `SELECT T1.CONVERSATION_ID, T1.CONVERSATION_NAME,
             (SELECT COUNT(*) FROM GROUP_MEMBER AS T3 WHERE T1.CONVERSATION_ID = T3.CONVERSATION_ID) AS CNT
             FROM CONVERSATION AS T1 WHERE EXISTS
             (SELECT * FROM GROUP_MEMBER AS T2 WHERE T1.CONVERSATION_ID = T2.CONVERSATION_ID
              AND T2.USER_UID = '${currentUser}' ORDER BY T2.JOINED_DATE DESC)
             AND T1.GUBUN = '단체톡';`;
```

#### Fixed Code
```typescript
const sql = `SELECT T1.CONVERSATION_ID, T1.CONVERSATION_NAME,
             (SELECT COUNT(*) FROM GROUP_MEMBER AS T3 WHERE T1.CONVERSATION_ID = T3.CONVERSATION_ID) AS CNT
             FROM CONVERSATION AS T1 WHERE EXISTS
             (SELECT * FROM GROUP_MEMBER AS T2 WHERE T1.CONVERSATION_ID = T2.CONVERSATION_ID
              AND T2.USER_UID = ? ORDER BY T2.JOINED_DATE DESC)
             AND T1.GUBUN = '단체톡'`;
const result = await queryExecutorResult2(sql, [currentUser]);
```

---

### Location 5: boardController.ts (Line 34)
**File:** `/home/user/DTech_BE/src/controllers/boardController.ts`

#### Current Code (VULNERABLE)
```typescript
let sql3 = 'INSERT INTO BOARD_URL VALUES ';
const s3Url = `https://dcx-tech.s3.ap-northeast-2.amazonaws.com/`;
for (let i = 0; i < imgArr.length; i++) {
  sql3 += `('${resultData2.queryResult[0].BOARD_CD}',${i + 1},'image','${s3Url + imgArr[i]}'),`;
}
sql3 = sql3.slice(0, -1);
const resultData3 = await queryExecutorResult2(sql3, []);
```

#### Fixed Code
```typescript
const boardId = resultData2.queryResult[0].BOARD_CD;
const s3Url = `https://${process.env.BUCKET_BASE}.s3.ap-northeast-2.amazonaws.com/`;
const urlInserts = imgArr.map((img, index) => {
  const sql = `INSERT INTO BOARD_URL (BOARD_CD, URL_ORDER, URL_TYPE, URL_ADDR) VALUES (?, ?, ?, ?)`;
  return queryExecutorResult2(sql, [boardId, index + 1, 'image', s3Url + img]);
});

const results = await Promise.all(urlInserts);
const hasErrors = results.some(r => r.status === 'error');
if (hasErrors) {
  return res.status(500).json({ resultData: results, message: 'image insert failed' });
}
```

---

## ISSUE 2: DATABASE ERROR EXPOSURE

### Current Code (VULNERABLE)
Multiple locations return database errors to client:

```typescript
// authController.ts (Line 49-52)
return res.status(401).json({
  result: 'fail',
  message: 'resultData1 failed',
  status: resultData.status,
  sqlMessage: resultData.sqlMessage,  // EXPOSED DATABASE ERROR!
});

// chatController.ts (Line 105)
if (result1.status === 'error') {
  return next(new ErrorResponse('채팅방을 만들지 못했습니다', 500));
}
```

### Fixed Pattern

```typescript
// Create a utility function
// utils/errorHandler.ts
import logger from './logger';
import { ErrorResponse } from './errorResponse';

export const handleDbError = (dbError: any, errorMessage: string, statusCode: number = 500) => {
  // Log details server-side
  logger.error({
    sqlMessage: dbError.sqlMessage,
    code: dbError.code,
    errno: dbError.errno,
    timestamp: new Date()
  });

  // Return generic message to client
  return new ErrorResponse(errorMessage, statusCode);
};

// Usage in controllers
const resultData = await queryExecutorResult2(sql, params);
if (resultData.status === 'error') {
  return next(handleDbError(resultData, 'Database operation failed'));
}
```

### Fix All Instances

Search for and replace:
```typescript
// WRONG - DELETE THESE PATTERNS
sqlMessage: resultData.sqlMessage
status: resultData.status
status: resultData2.status

// REPLACE with generic messages:
const errorMsg = 'An error occurred while processing your request';
return next(new ErrorResponse(errorMsg, 500));
```

---

## ISSUE 3: MISSING AUTHENTICATION

### List of Unprotected Endpoints That SHOULD Be Protected

```typescript
// authController.ts
POST /api/auth/uploadUserImg          // Should protect: only user can upload own image
POST /api/auth/getUsersStatus         // OK - public status check
GET  /api/auth/getUsersInfo           // Needs permission check

// chatController.ts
POST /api/chat/getPrivateChatList     // PROTECT: only participants can access
POST /api/chat/getGroupChatList       // PROTECT: only group members can access
POST /api/chat/getUnreadChatNoti      // PROTECT: only authenticated users
POST /api/chat/createChatGroup        // PROTECT: only authenticated users
POST /api/chat/getChatGroups          // PROTECT: only authenticated users
POST /api/chat/uploadChatImg          // PROTECT: only authenticated users
POST /api/chat/insertPrivateChatMessage // PROTECT: only sender can send as themselves
POST /api/chat/insertGroupChatMessage   // PROTECT: only group members can send

// boardController.ts
POST /api/board/getBoardList          // OK - public, but check permissions on edit
POST /api/board/setBoardLike          // PROTECT: only authenticated users
POST /api/board/uploadBoard           // PROTECT: only authenticated users
POST /api/board/getComments           // OK - public
POST /api/board/setComment            // PROTECT: only authenticated users
POST /api/board/deleteCmnt            // PROTECT: only owner or admin
POST /api/board/deleteBoard           // PROTECT: only owner or admin

// dashboardController.ts
POST /api/dashboard/getTeamSkills     // OK - public (team viewing)
POST /api/dashboard/getUserSkillFilter // OK - public
```

### Fix Pattern: Add Protection to Routes

```typescript
// Before
router.post('/getPrivateChatList', getPrivateChatList);

// After - Add middleware
import { protectedApi } from '../middleware/auth';
import { validateChatAccess } from '../middleware/chatAuth';

router.post('/getPrivateChatList', protectedApi, validateChatAccess, getPrivateChatList);
```

### New Middleware: Permission Checks

```typescript
// middleware/chatAuth.ts
import { asyncHandler } from './async';
import { ErrorResponse } from '../util/errorResponse';
import { queryExecutorResult2 } from '../util/queryExecutorResult';

export const validateChatAccess = asyncHandler(async (req: any, res, next) => {
  const { fromUID, toUID, convId } = req.body;
  const currentUserId = req.user.USER_UID;

  // Check if user is participant in this conversation
  const sql = `SELECT * FROM CONVERSATION WHERE CONVERSATION_ID = ?
               AND (EXISTS (SELECT 1 FROM GROUP_MEMBER WHERE CONVERSATION_ID = ? AND USER_UID = ?)
                    OR EXISTS (SELECT 1 FROM PRIVATE_CHAT WHERE CONV_ID = ?
                               AND (FROM_UID = ? OR TO_UID = ?)))`;

  const result = await queryExecutorResult2(sql, [convId, convId, currentUserId, convId, currentUserId, currentUserId]);

  if (!result.queryResult || result.queryResult.length === 0) {
    return next(new ErrorResponse('Unauthorized access to chat', 403));
  }

  next();
});

// middleware/boardAuth.ts
export const validateBoardOwnership = asyncHandler(async (req: any, res, next) => {
  const { boardId } = req.body;
  const currentUserId = req.user.USER_UID;
  const isAdmin = req.user.USER_ADMIN_YN === 'Y';

  const sql = `SELECT * FROM BOARD WHERE BOARD_CD = ? AND USER_UID = ?`;
  const result = await queryExecutorResult2(sql, [boardId, currentUserId]);

  if (!result.queryResult || result.queryResult.length === 0) {
    if (!isAdmin) {
      return next(new ErrorResponse('You can only modify your own posts', 403));
    }
  }

  next();
});

export const validateCommentOwnership = asyncHandler(async (req: any, res, next) => {
  const { commentId } = req.body;
  const currentUserId = req.user.USER_UID;
  const isAdmin = req.user.USER_ADMIN_YN === 'Y';

  const sql = `SELECT * FROM COMMENT WHERE COMMENT_CD = ? AND USER_UID = ?`;
  const result = await queryExecutorResult2(sql, [commentId, currentUserId]);

  if (!result.queryResult || result.queryResult.length === 0) {
    if (!isAdmin) {
      return next(new ErrorResponse('You can only delete your own comments', 403));
    }
  }

  next();
});
```

---

## ISSUE 4: INCORRECT HTTP STATUS CODES

### Fix Error Handler

```typescript
// middleware/error.ts - BEFORE
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err };
  error.message = err.message;

  return res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
};

// middleware/error.ts - AFTER
import logger from '../util/logger';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Log error for debugging
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.USER_ID,
  });

  let statusCode = 500;
  let message = 'An unexpected error occurred';

  // Custom error type
  if (err instanceof ErrorResponse) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Validation errors
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
  }
  // Database errors - NEVER expose details!
  else if (err.code?.startsWith('ER_') || err.errno) {
    statusCode = 500;
    message = 'Database error occurred';  // Generic message
  }
  // JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid or expired token';
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
  }

  return res.status(statusCode).json({
    success: false,
    error: message,
    // Include error ID for support team to look up detailed logs
    ...(req.id && { errorId: req.id }),
  });
};

export default errorHandler;
```

---

## ISSUE 5: S3 SECURITY CONFIGURATION

### Current Code (VULNERABLE)
```typescript
// s3Connect.ts
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: `${process.env.BUCKET_BASE}`,
    acl: 'public-read-write',  // DANGEROUS! World can read AND write!
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: async function (req: ExpressRequest, file: Express.Multer.File, cb: MulterCallback) {
      // ...
    },
  }),
});
```

### Fixed Code
```typescript
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: `${process.env.BUCKET_BASE}`,
    acl: 'private',  // Files are private by default
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: async function (req: ExpressRequest, file: Express.Multer.File, cb: MulterCallback) {
      const postData = JSON.parse(req.body.postData || '{}');
      const filename = `${postData.dir}${Date.now()}_${file.originalname}`;
      cb(null, filename);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },  // 10MB limit
  fileFilter: (req, file, cb) => {
    // Whitelist image types
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Helper to generate pre-signed URLs (for private files)
export const getPresignedUrl = async (key: string, expiresIn = 3600) => {
  const params = {
    Bucket: process.env.BUCKET_BASE,
    Key: key,
    Expires: expiresIn,
  };
  return await s3.getSignedUrlPromise('getObject', params);
};
```

---

## IMPLEMENTATION CHECKLIST

### Week 1: Critical Fixes
- [ ] Fix all SQL injection vulnerabilities (5 locations)
  - [ ] src/middleware/auth.ts:27
  - [ ] src/controllers/dashboardController.ts:42
  - [ ] src/controllers/chatController.ts:110
  - [ ] src/controllers/chatController.ts:137
  - [ ] src/controllers/boardController.ts:34
- [ ] Stop returning database errors to clients
  - [ ] Create handleDbError utility function
  - [ ] Replace all sqlMessage exposures
- [ ] Add authentication middleware to unprotected routes
  - [ ] Chat endpoints (8 routes)
  - [ ] Board endpoints (3 routes)
  - [ ] Auth endpoints (1 route)
- [ ] Fix S3 ACL configuration
  - [ ] Change acl to 'private'
  - [ ] Add fileFilter
  - [ ] Implement getPresignedUrl

### Week 2: Security Hardening
- [ ] Add input validation to all endpoints
  - [ ] Install express-validator or Zod
  - [ ] Create validators for each controller
  - [ ] Apply to all routes
- [ ] Implement rate limiting
  - [ ] Install express-rate-limit
  - [ ] Apply global limiter
  - [ ] Add stricter limits for login
- [ ] Add helmet for security headers
  - [ ] Install and configure helmet
- [ ] Create permission checking middleware
  - [ ] chatAuth.ts
  - [ ] boardAuth.ts

### Week 3: Architecture
- [ ] Create service layer for database operations
- [ ] Create repository abstractions
- [ ] Implement data transformation/DTOs
- [ ] Add structured logging (Winston)

### Week 4: Quality
- [ ] Set up Jest testing
- [ ] Write unit tests for controllers
- [ ] Write integration tests for APIs
- [ ] Set up error tracking (Sentry)

---

## Testing the Fixes

### SQL Injection Test
```typescript
// BEFORE: Vulnerable endpoint
POST /api/dashboard/getUserSkillFilter
{
  "filterName": "' OR '1'='1"  // SQL injection attempt
}
// Result: Returns all users (SQL injection successful)

// AFTER: Protected by parameterization
POST /api/dashboard/getUserSkillFilter
{
  "filterName": "' OR '1'='1"
}
// Result: Searches for literal string "' OR '1'='1" (injection fails)
```

### Authentication Test
```typescript
// BEFORE: No authentication needed
POST /api/chat/insertPrivateChatMessage
{
  "fromUID": "attacker_id",
  "toUID": "victim_id",
  "chatMessage": "I'm impersonating someone!"
}
// Result: Message sent successfully (no verification)

// AFTER: Middleware validates sender
POST /api/chat/insertPrivateChatMessage
Headers: { Authorization: "Bearer <token>" }
{
  "toUID": "victim_id",
  "chatMessage": "Legitimate message"
}
// Result: Uses actual user from JWT token
```

### Error Exposure Test
```typescript
// BEFORE: Database details exposed
POST /api/auth/loginUser
{
  "userId": "nonexistent",
  "password": "test"
}
// Response:
{
  "sqlMessage": "Unknown column 'USER_ID' in 'where clause'",
  "errno": 1054,
  "code": "ER_BAD_FIELD_ERROR"
}

// AFTER: Generic error message
POST /api/auth/loginUser
{
  "userId": "nonexistent",
  "password": "test"
}
// Response:
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

## Quick Reference: File Locations

**Files to Modify:**
1. `src/middleware/auth.ts` - Fix SQL injection on line 27
2. `src/controllers/dashboardController.ts` - Fix SQL injection on line 42
3. `src/controllers/chatController.ts` - Fix SQL injection on lines 110, 137
4. `src/controllers/boardController.ts` - Fix SQL injection on line 34
5. `src/util/s3Connect.ts` - Fix S3 ACL configuration
6. `src/middleware/error.ts` - Improve error handler
7. All controller files - Remove sqlMessage exposures

**Files to Create:**
1. `src/middleware/chatAuth.ts` - Chat permission checks
2. `src/middleware/boardAuth.ts` - Board ownership validation
3. `src/util/errorHandler.ts` - DB error handling utility
4. `src/util/logger.ts` - Winston logger configuration

**Routes to Protect:**
- `src/routes/chat.ts` - Add protectedApi to 8 endpoints
- `src/routes/board.ts` - Add protectedApi to 5 endpoints
- `src/routes/login.ts` - Add protectedApi to 1 endpoint
