import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root',
})
export class VotingService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://127.0.0.1:8000/api';

  // ── Auth endpoints ─────────────────────────────────────────────────

  registerVoter(data: RegisterPayload): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/register/`, data);
  }

  loginVoter(credentials: LoginCredentials): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/voters/login/`, credentials);
  }

  // ── Location endpoints ─────────────────────────────────────────────

  getCounties(): Observable<unknown> {
    return this.http.get(`${this.apiUrl}/counties/`);
  }

  getConstituencies(countyId: number): Observable<unknown> {
    return this.http.get(`${this.apiUrl}/constituencies/?county=${countyId}`);
  }

  getWards(constituencyId: number): Observable<unknown> {
    return this.http.get(`${this.apiUrl}/wards/?constituency=${constituencyId}`);
  }

  // ── Voting endpoints ───────────────────────────────────────────────

  getSeats(): Observable<unknown> {
    return this.http.get(`${this.apiUrl}/seats/`);
  }

  getCandidates(seatType?: string): Observable<unknown> {
    const url = seatType
      ? `${this.apiUrl}/candidates/?seat_type=${seatType}`
      : `${this.apiUrl}/candidates/`;
    return this.http.get(url);
  }

  submitVote(voterId: number, seatId: number, candidateId: number): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/votes/`, {
      voter: voterId,
      seat: seatId,
      candidate: candidateId,
    });
  }

  getResults(): Observable<unknown> {
    return this.http.get(`${this.apiUrl}/votes/results/`);
  }
}