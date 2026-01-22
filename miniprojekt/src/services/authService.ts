

const TOKEN_KEY = 'medapp_access_token';
const REFRESH_TOKEN_KEY = 'medapp_refresh_token';

export interface AuthTokens {
    accessToken: string;
    user: {
        id: number;
        email: string;
        role: string;
        name?: string;
    };
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
    role?: string;
}

class AuthService {
    private baseUrl = 'http://localhost:3000';

    // Store token
    setToken(token: string): void {
        localStorage.setItem(TOKEN_KEY, token);
    }

    // Get stored token
    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    }

    // Clear token (logout)
    clearToken(): void {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    }

    // Check if token exists
    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    // Parse JWT token payload
    parseToken(token: string): any {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch {
            return null;
        }
    }

    // Check if token is expired
    isTokenExpired(token: string): boolean {
        const payload = this.parseToken(token);
        if (!payload || !payload.exp) return true;
        return Date.now() >= payload.exp * 1000;
    }

    // Get authorization header
    getAuthHeader(): { Authorization: string } | {} {
        const token = this.getToken();
        if (token && !this.isTokenExpired(token)) {
            return { Authorization: `Bearer ${token}` };
        }
        return {};
    }

    // Login with json-server-auth
    async login(credentials: LoginCredentials): Promise<AuthTokens> {
        const response = await fetch(`${this.baseUrl}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        const data = await response.json();
        this.setToken(data.accessToken);

        return {
            accessToken: data.accessToken,
            user: data.user,
        };
    }

    // Register with json-server-auth
    async register(data: RegisterData): Promise<AuthTokens> {
        const response = await fetch(`${this.baseUrl}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: data.email,
                password: data.password,
                name: data.name,
                role: data.role || 'patient',
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }

        const result = await response.json();
        this.setToken(result.accessToken);

        return {
            accessToken: result.accessToken,
            user: result.user,
        };
    }

    // Logout
    logout(): void {
        this.clearToken();
    }

    // Make authenticated request
    async authFetch(url: string, options: RequestInit = {}): Promise<Response> {
        const token = this.getToken();

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token && !this.isTokenExpired(token)) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers,
        });

        // If 401, clear token and throw
        if (response.status === 401) {
            this.clearToken();
            throw new Error('Unauthorized - please login again');
        }

        return response;
    }
}

export const authService = new AuthService();
