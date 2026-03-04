import { Injectable, signal, computed } from '@angular/core';

export interface Voter {
  id: number;
  full_name: string;
  voter_code: string;
  id_number: string;
  county: string;
  constituency: string;
  ward: string;
}

const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';
const USER_KEY = 'current_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly currentUser = signal<Voter | null>(this.loadUser());

  /** Readonly signal exposed to consumers. */
  readonly voter = this.currentUser.asReadonly();

  /** Computed convenience flag. */
  readonly isLoggedIn = computed(() => this.currentUser() !== null);

  // ── Token helpers ──────────────────────────────────────────────────

  getAccessToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  private setTokens(access: string, refresh: string): void {
    sessionStorage.setItem(TOKEN_KEY, access);
    sessionStorage.setItem(REFRESH_KEY, refresh);
  }

  getRefreshToken(): string | null {
    return sessionStorage.getItem(REFRESH_KEY);
  }

  // ── User helpers ───────────────────────────────────────────────────

  /** Called after a successful login response. */
  handleLoginResponse(response: {
    access: string;
    refresh: string;
    voter: Voter;
  }): void {
    this.setTokens(response.access, response.refresh);
    sessionStorage.setItem(USER_KEY, JSON.stringify(response.voter));
    this.currentUser.set(response.voter);
  }

  getCurrentUser(): Voter | null {
    return this.currentUser();
  }

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
    sessionStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
  }

  // ── Private ────────────────────────────────────────────────────────

  private loadUser(): Voter | null {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as Voter) : null;
  }
}