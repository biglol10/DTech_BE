# DTech Backend - Frontend Authentication Guide

완전히 새로운 **Refresh Token 기반 인증 시스템**이 구현되었습니다. 이 문서는 프론트엔드에서 이를 활용하는 방법을 설명합니다.

---

## 📋 목차

1. [변경 사항 요약](#변경-사항-요약)
2. [API 엔드포인트](#api-엔드포인트)
3. [에러 코드 체계](#에러-코드-체계)
4. [프론트엔드 구현 가이드](#프론트엔드-구현-가이드)
5. [React/Next.js 예시 코드](#reactnextjs-예시-코드)
6. [Axios Interceptor 설정](#axios-interceptor-설정)
7. [테스트 시나리오](#테스트-시나리오)

---

## 변경 사항 요약

### 이전 (Before)
```javascript
// 로그인 응답
{
  "result": "success",
  "token": "single-jwt-token-7days",
  "name": "홍길동",
  "userId": "user123"
}

// 쿠키에 저장됨 (7일)
```

### 현재 (After)
```javascript
// 로그인 응답
{
  "success": true,
  "result": "success",
  "accessToken": "short-lived-token-15min",  // ← 이걸 사용!
  "user": {
    "name": "홍길동",
    "userId": "user123",
    "userUID": "uuid-...",
    "userProfileImg": "https://..."
  }
}

// + refreshToken은 자동으로 HttpOnly 쿠키에 저장됨 (7일)
```

### 주요 차이점

| 항목 | 이전 | 현재 |
|------|------|------|
| **Access Token 수명** | 7일 | 15분 |
| **Refresh Token** | ❌ 없음 | ✅ 있음 (7일, HttpOnly 쿠키) |
| **자동 갱신** | ❌ 불가능 | ✅ 가능 |
| **보안** | 낮음 | 높음 |
| **에러 코드** | ❌ 없음 | ✅ 구조화됨 |

---

## API 엔드포인트

### 1. 회원가입
```http
POST /api/auth/registerUser
Content-Type: application/json

{
  "name": "홍길동",
  "user_id": "hong123",
  "passwd": "SecurePass123!",
  "team": "TEAM001",
  "title": "Developer",
  "phonenum": "010-1234-5678",
  "tech_list": ["TECH001", "TECH002"]
}
```

**응답 (201 Created)**
```json
{
  "success": true,
  "result": "success",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "name": "홍길동",
    "title": "Developer",
    "user_id": "hong123",
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "time": "2025-01-15 14:30:00"
  }
}

// Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

---

### 2. 로그인
```http
POST /api/auth/loginUser
Content-Type: application/json

{
  "userId": "hong123",
  "password": "SecurePass123!"
}
```

**응답 (200 OK)**
```json
{
  "success": true,
  "result": "success",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "name": "홍길동",
    "userId": "hong123",
    "userUID": "550e8400-e29b-41d4-a716-446655440000",
    "userProfileImg": "https://...",
    "time": "2025-01-15 14:30:00"
  }
}

// Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict
```

---

### 3. Access Token 갱신
```http
POST /api/auth/refresh
Cookie: refreshToken=...
```

**응답 (200 OK)**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Access token refreshed successfully"
}
```

**에러 (401 Unauthorized)**
```json
{
  "success": false,
  "message": "Refresh token has expired. Please login again.",
  "errorCode": "REFRESH_TOKEN_EXPIRED"
}
```

---

### 4. 로그아웃
```http
POST /api/auth/logout
```

**응답 (200 OK)**
```json
{
  "success": true,
  "message": "Logged out successfully"
}

// Set-Cookie: refreshToken=; Max-Age=0 (쿠키 삭제)
```

---

### 5. 보호된 API 호출
```http
GET /api/auth/getLoggedInUserInfo
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**응답 (200 OK)**
```json
{
  "user": {
    "USER_UID": "...",
    "USER_ID": "hong123",
    "USER_NM": "홍길동"
  }
}
```

**에러 (401 Unauthorized) - Access Token 만료**
```json
{
  "success": false,
  "message": "Access token has expired. Please refresh your token.",
  "errorCode": "ACCESS_TOKEN_EXPIRED"
}
```

---

## 에러 코드 체계

프론트엔드에서 `errorCode` 필드를 확인하여 자동 처리할 수 있습니다.

| 에러 코드 | HTTP 상태 | 의미 | 프론트엔드 액션 |
|-----------|-----------|------|----------------|
| `ACCESS_TOKEN_EXPIRED` | 401 | Access Token 만료 | **자동으로 `/refresh` 호출** |
| `REFRESH_TOKEN_EXPIRED` | 401 | Refresh Token 만료 | **로그인 페이지로 리다이렉트** |
| `INVALID_ACCESS_TOKEN` | 401 | 잘못된 Access Token | 로그인 페이지로 |
| `INVALID_REFRESH_TOKEN` | 401 | 잘못된 Refresh Token | 로그인 페이지로 |
| `NO_TOKEN_PROVIDED` | 401 | 토큰 없음 | 로그인 페이지로 |
| `INVALID_CREDENTIALS` | 401 | 아이디/비밀번호 오류 | 에러 메시지 표시 |
| `UNAUTHORIZED` | 401 | 권한 없음 | 접근 거부 메시지 |
| `FORBIDDEN` | 403 | 금지된 리소스 | 접근 거부 메시지 |
| `RESOURCE_NOT_FOUND` | 404 | 리소스 없음 | Not Found 페이지 |
| `DUPLICATE_RESOURCE` | 409 | 중복 (아이디 등) | 에러 메시지 표시 |
| `VALIDATION_ERROR` | 400 | 입력값 오류 | 유효성 검사 메시지 |

---

## 프론트엔드 구현 가이드

### 1단계: 로그인 후 토큰 저장

```typescript
// utils/auth.ts
export const login = async (userId: string, password: string) => {
  try {
    const response = await fetch('/api/auth/loginUser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',  // ← 중요! Refresh Token 쿠키를 받기 위해
      body: JSON.stringify({ userId, password }),
    });

    const data = await response.json();

    if (data.success) {
      // Access Token을 메모리나 상태 관리에 저장
      localStorage.setItem('accessToken', data.accessToken);

      // 또는 상태 관리 라이브러리에 저장
      // setAccessToken(data.accessToken);

      // 사용자 정보 저장
      localStorage.setItem('user', JSON.stringify(data.user));

      return { success: true, user: data.user };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Network error' };
  }
};
```

### 2단계: API 요청 시 Authorization 헤더 추가

```typescript
// utils/api.ts
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const accessToken = localStorage.getItem('accessToken');

  const response = await fetch(url, {
    ...options,
    credentials: 'include',  // Refresh Token 쿠키 포함
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  return response;
};
```

### 3단계: Access Token 만료 시 자동 갱신

```typescript
// utils/api.ts
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const accessToken = localStorage.getItem('accessToken');

  let response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  // Access Token이 만료되었을 때
  if (response.status === 401) {
    const errorData = await response.json();

    // 에러 코드 확인
    if (errorData.errorCode === 'ACCESS_TOKEN_EXPIRED') {
      console.log('Access token expired, refreshing...');

      // Refresh Token으로 새로운 Access Token 요청
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',  // Refresh Token 쿠키 포함
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();

        // 새로운 Access Token 저장
        localStorage.setItem('accessToken', refreshData.accessToken);

        // 원래 요청 재시도
        response = await fetch(url, {
          ...options,
          credentials: 'include',
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${refreshData.accessToken}`,
            'Content-Type': 'application/json',
          },
        });
      } else {
        // Refresh Token도 만료됨 → 로그인 페이지로
        const refreshError = await refreshResponse.json();

        if (refreshError.errorCode === 'REFRESH_TOKEN_EXPIRED') {
          console.log('Refresh token expired, redirecting to login...');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    } else {
      // 다른 401 에러 → 로그인 페이지로
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }

  return response;
};
```

### 4단계: 로그아웃

```typescript
// utils/auth.ts
export const logout = async () => {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',  // Refresh Token 쿠키 전송
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // 클라이언트 측 데이터 정리
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};
```

---

## React/Next.js 예시 코드

### Context API를 사용한 인증 관리

```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  userId: string;
  name: string;
  userUID: string;
  userProfileImg?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (userId: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // 초기 로드 시 토큰 복원
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setAccessToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (userId: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/loginUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, password }),
      });

      const data = await response.json();

      if (data.success) {
        setAccessToken(data.accessToken);
        setUser(data.user);
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        return true;
      } else {
        console.error('Login failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  };

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setAccessToken(data.accessToken);
        localStorage.setItem('accessToken', data.accessToken);
        return true;
      } else {
        // Refresh 실패 → 로그아웃
        await logout();
        return false;
      }
    } catch (error) {
      console.error('Refresh error:', error);
      await logout();
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Custom Hook으로 API 호출

```typescript
// hooks/useApi.ts
import { useAuth } from '@/contexts/AuthContext';

export const useApi = () => {
  const { accessToken, refreshAccessToken } = useAuth();

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    let response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Access Token 만료 시 자동 갱신
    if (response.status === 401) {
      const errorData = await response.json();

      if (errorData.errorCode === 'ACCESS_TOKEN_EXPIRED') {
        const refreshed = await refreshAccessToken();

        if (refreshed) {
          // 재시도
          response = await fetch(url, {
            ...options,
            credentials: 'include',
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json',
            },
          });
        }
      }
    }

    return response;
  };

  return { fetchWithAuth };
};
```

### 사용 예시

```typescript
// pages/dashboard.tsx
import { useApi } from '@/hooks/useApi';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { fetchWithAuth } = useApi();
  const [teamSkills, setTeamSkills] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetchWithAuth('/api/dashboard/getTeamSkills', {
        method: 'POST',
      });

      const data = await response.json();
      if (data.success) {
        setTeamSkills(data.teamSkills);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {/* ... */}
    </div>
  );
}
```

---

## Axios Interceptor 설정

Axios를 사용하는 경우 Interceptor를 설정하여 자동 갱신을 구현할 수 있습니다.

```typescript
// utils/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3066',
  withCredentials: true,  // Refresh Token 쿠키 포함
});

// Request Interceptor: Access Token 자동 추가
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Access Token 만료 시 자동 갱신
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Access Token 만료 확인
    if (error.response?.status === 401 && error.response?.data?.errorCode === 'ACCESS_TOKEN_EXPIRED') {
      // 재시도 방지 플래그
      if (originalRequest._retry) {
        return Promise.reject(error);
      }
      originalRequest._retry = true;

      try {
        // Refresh Token으로 새로운 Access Token 요청
        const refreshResponse = await axios.post(
          '/api/auth/refresh',
          {},
          { withCredentials: true }
        );

        const { accessToken } = refreshResponse.data;

        // 새로운 Access Token 저장
        localStorage.setItem('accessToken', accessToken);

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh Token도 만료됨 → 로그아웃
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Refresh Token 만료
    if (error.response?.data?.errorCode === 'REFRESH_TOKEN_EXPIRED') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
```

### 사용 예시

```typescript
// pages/dashboard.tsx
import api from '@/utils/axios';

export default function Dashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.post('/api/dashboard/getTeamSkills');
        setData(response.data.teamSkills);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, []);

  return <div>{/* ... */}</div>;
}
```

---

## 테스트 시나리오

### 시나리오 1: 정상 로그인 및 API 호출

```bash
# 1. 로그인
curl -X POST http://localhost:3066/api/auth/loginUser \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"userId": "testuser", "password": "password123"}'

# 응답에서 accessToken 추출
# → "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 2. 보호된 API 호출
curl -X POST http://localhost:3066/api/auth/getLoggedInUserInfo \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -b cookies.txt
```

### 시나리오 2: Access Token 만료 후 갱신

```bash
# 1. 15분 후 Access Token 만료됨

# 2. 보호된 API 호출 (401 에러 발생)
curl -X POST http://localhost:3066/api/auth/getLoggedInUserInfo \
  -H "Authorization: Bearer expired-token" \
  -b cookies.txt

# 응답:
# {
#   "success": false,
#   "message": "Access token has expired. Please refresh your token.",
#   "errorCode": "ACCESS_TOKEN_EXPIRED"
# }

# 3. Access Token 갱신
curl -X POST http://localhost:3066/api/auth/refresh \
  -b cookies.txt

# 응답:
# {
#   "success": true,
#   "accessToken": "new-access-token...",
#   "message": "Access token refreshed successfully"
# }

# 4. 새로운 Access Token으로 재시도
curl -X POST http://localhost:3066/api/auth/getLoggedInUserInfo \
  -H "Authorization: Bearer new-access-token..." \
  -b cookies.txt
```

### 시나리오 3: Refresh Token 만료

```bash
# 1. 7일 후 Refresh Token 만료됨

# 2. Refresh 시도 (401 에러)
curl -X POST http://localhost:3066/api/auth/refresh \
  -b cookies.txt

# 응답:
# {
#   "success": false,
#   "message": "Refresh token has expired. Please login again.",
#   "errorCode": "REFRESH_TOKEN_EXPIRED"
# }

# 3. 프론트엔드는 로그인 페이지로 리다이렉트
```

---

## 🔐 보안 Best Practices

1. **Access Token은 localStorage에 저장**
   - XSS 공격에 취약하지만, 15분 수명으로 리스크 최소화
   - 대안: 메모리에만 저장 (새로고침 시 재로그인 필요)

2. **Refresh Token은 HttpOnly 쿠키에 저장**
   - JavaScript로 접근 불가 → XSS 공격 방지
   - Secure 플래그 (HTTPS)
   - SameSite=Strict (CSRF 방어)

3. **HTTPS 필수**
   - 프로덕션 환경에서는 반드시 HTTPS 사용
   - Refresh Token 쿠키의 `Secure` 플래그 활성화

4. **에러 코드 기반 자동 처리**
   - `ACCESS_TOKEN_EXPIRED` → 자동 갱신
   - `REFRESH_TOKEN_EXPIRED` → 로그인 페이지

5. **로그아웃 시 명시적으로 처리**
   - 서버에 로그아웃 요청
   - 클라이언트 측 토큰 삭제

---

## 🚀 Quick Start Checklist

- [ ] `.env` 파일에 `JWT_REFRESH_SECRET` 추가
- [ ] 프론트엔드에 Axios Interceptor 설정
- [ ] 로그인 로직 수정 (`accessToken` 저장)
- [ ] API 호출 시 `Authorization: Bearer ${accessToken}` 헤더 추가
- [ ] `credentials: 'include'` 옵션 추가 (Refresh Token 쿠키)
- [ ] 401 에러 시 `errorCode` 확인하여 자동 갱신 구현
- [ ] 로그아웃 API 호출 추가

---

## 📞 문제 해결

### Q: "Access token has expired" 에러가 계속 발생해요
**A:** Axios Interceptor가 제대로 설정되었는지 확인하세요. `/api/auth/refresh`가 정상 동작하는지 확인하세요.

### Q: Refresh Token이 쿠키에 저장되지 않아요
**A:** `credentials: 'include'` 또는 `withCredentials: true` 옵션을 추가했는지 확인하세요.

### Q: CORS 에러가 발생해요
**A:** 백엔드의 CORS 설정에서 `credentials: true` 옵션이 활성화되어 있는지 확인하세요.

### Q: 새로고침 시 로그인이 풀려요
**A:** `localStorage`에 `accessToken`이 저장되어 있는지 확인하세요. Context Provider가 초기 로드 시 토큰을 복원하는지 확인하세요.

---

**작성일:** 2025-10-23
**문서 버전:** 1.0
