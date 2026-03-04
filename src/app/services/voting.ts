import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ── Shared interfaces ────────────────────────────────────────────────

export interface RegisterPayload {
  full_name: string;
  id_number: string;
  phone_number?: string;
  email?: string;
  county: string;
  constituency: string;
  ward: string;
  password: string;
}

export interface LoginCredentials {
  id_number: string;
  password: string;
}

export interface Seat {
  id: number;
  seat_type: string;
  name: string;
  level: string;
  icon: string | null;
  county: string | null;
  constituency: string | null;
  ward: string | null;
  has_voted: boolean;
}

export interface Candidate {
  id: number;
  seat: number;
  seat_type: string;
  full_name: string;
  party: string | null;
  photo_url: string | null;
  manifesto: string | null;
}

export interface VoteResult {
  candidate_id: number;
  candidate_name: string;
  party: string | null;
  seat_id: number;
  seat_type: string;
  seat_name: string;
  vote_count: number;
}

@Injectable({
  providedIn: 'root',
})
export class VotingService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://127.0.0.1:8000/api';

  // ── Auth endpoints (public) ────────────────────────────────────────

  registerVoter(data: RegisterPayload): Observable<{ message: string; voter_code: string }> {
    return this.http.post<{ message: string; voter_code: string }>(
      `${this.apiUrl}/register/`,
      data,
    );
  }

  loginVoter(credentials: LoginCredentials): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/voters/login/`, credentials);
  }

  // ── Electoral data (authenticated) ─────────────────────────────────

  /** Seats the logged-in voter is eligible for, with `has_voted` flag. */
  getSeats(): Observable<Seat[]> {
    return this.http.get<Seat[]>(`${this.apiUrl}/seats/`);
  }

  /** Candidates running for a specific seat. */
  getCandidates(seatId: number): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${this.apiUrl}/seats/${seatId}/candidates/`);
  }

  /** Cast a vote. */
  submitVote(seatId: number, candidateId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/votes/`, {
      seat: seatId,
      candidate: candidateId,
    });
  }

  /** Aggregated results for all seats. */
  getResults(): Observable<VoteResult[]> {
    return this.http.get<VoteResult[]>(`${this.apiUrl}/votes/results/`);
  }

  /** Seat IDs the current voter already voted on. */
  getMyVotes(): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/votes/mine/`);
  }
}