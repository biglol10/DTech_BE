import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

/**
 * Token Types
 */
export interface TokenPair {
	accessToken: string;
	refreshToken: string;
}

export interface AccessTokenPayload {
	id: string;
	type: 'access';
	iat?: number;
	exp?: number;
}

export interface RefreshTokenPayload {
	id: string;
	tokenId: string;
	type: 'refresh';
	iat?: number;
	exp?: number;
}

/**
 * TokenService
 * Handles JWT token generation and verification
 */
class TokenService {
	private accessTokenSecret: string;
	private refreshTokenSecret: string;
	private accessTokenExpiry: string;
	private refreshTokenExpiry: string;

	constructor() {
		this.accessTokenSecret = process.env.JWT_SECRET || 'fallback-access-secret-change-in-production';
		this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change-in-production';
		this.accessTokenExpiry = process.env.JWT_EXPIRE || '15m';
		this.refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRE || '7d';

		// Warning if using fallback secrets
		if (!process.env.JWT_SECRET) {
			console.warn('⚠️  WARNING: JWT_SECRET not set. Using fallback (INSECURE)');
		}
		if (!process.env.JWT_REFRESH_SECRET) {
			console.warn('⚠️  WARNING: JWT_REFRESH_SECRET not set. Using fallback (INSECURE)');
		}
	}

	/**
	 * Generate Access Token (short-lived: 15 minutes)
	 */
	generateAccessToken(userId: string): string {
		const payload: AccessTokenPayload = {
			id: userId,
			type: 'access',
		};

		return jwt.sign(payload, this.accessTokenSecret, {
			expiresIn: this.accessTokenExpiry,
		});
	}

	/**
	 * Generate Refresh Token (long-lived: 7 days)
	 */
	generateRefreshToken(userId: string): string {
		const tokenId = uuidv4(); // Unique ID for token tracking/revocation
		const payload: RefreshTokenPayload = {
			id: userId,
			tokenId,
			type: 'refresh',
		};

		return jwt.sign(payload, this.refreshTokenSecret, {
			expiresIn: this.refreshTokenExpiry,
		});
	}

	/**
	 * Generate both Access and Refresh tokens
	 */
	generateTokenPair(userId: string): TokenPair {
		return {
			accessToken: this.generateAccessToken(userId),
			refreshToken: this.generateRefreshToken(userId),
		};
	}

	/**
	 * Verify Access Token
	 */
	verifyAccessToken(token: string): AccessTokenPayload {
		try {
			const decoded = jwt.verify(token, this.accessTokenSecret) as AccessTokenPayload;

			if (decoded.type !== 'access') {
				throw new Error('Invalid token type');
			}

			return decoded;
		} catch (error: any) {
			if (error.name === 'TokenExpiredError') {
				throw new Error('ACCESS_TOKEN_EXPIRED');
			}
			if (error.name === 'JsonWebTokenError') {
				throw new Error('INVALID_ACCESS_TOKEN');
			}
			throw error;
		}
	}

	/**
	 * Verify Refresh Token
	 */
	verifyRefreshToken(token: string): RefreshTokenPayload {
		try {
			const decoded = jwt.verify(token, this.refreshTokenSecret) as RefreshTokenPayload;

			if (decoded.type !== 'refresh') {
				throw new Error('Invalid token type');
			}

			return decoded;
		} catch (error: any) {
			if (error.name === 'TokenExpiredError') {
				throw new Error('REFRESH_TOKEN_EXPIRED');
			}
			if (error.name === 'JsonWebTokenError') {
				throw new Error('INVALID_REFRESH_TOKEN');
			}
			throw error;
		}
	}

	/**
	 * Get cookie options for refresh token
	 */
	getRefreshTokenCookieOptions() {
		const cookieExpire = process.env.COOKIE_EXPIRE ? parseInt(process.env.COOKIE_EXPIRE, 10) : 7;

		return {
			httpOnly: true, // Prevent XSS attacks
			secure: process.env.NODE_ENV === 'production', // HTTPS only in production
			sameSite: 'strict' as const, // CSRF protection
			maxAge: cookieExpire * 24 * 60 * 60 * 1000, // 7 days in milliseconds
			path: '/', // Available for all routes
		};
	}
}

// Singleton instance
export const tokenService = new TokenService();
