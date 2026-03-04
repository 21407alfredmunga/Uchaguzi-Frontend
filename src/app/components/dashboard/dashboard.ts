import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { VotingService, Seat, Candidate } from '../../services/voting';

/** Fallback icons when the DB seat has no icon stored. */
const SEAT_ICONS: Record<string, string> = {
  president: '🇰🇪',
  governor: '🏛️',
  senator: '⚖️',
  mp: '📋',
  woman_rep: '👩',
  mca: '🏘️',
};

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly votingService = inject(VotingService);

  // ── State signals ──────────────────────────────────────────────────

  readonly voter = this.authService.voter;
  readonly seats = signal<Seat[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  /** The seat the voter is currently casting a ballot for (modal open). */
  readonly activeSeat = signal<Seat | null>(null);
  readonly candidates = signal<Candidate[]>([]);
  readonly loadingCandidates = signal(false);
  readonly selectedCandidate = signal<Candidate | null>(null);
  readonly submitting = signal(false);
  readonly voteMessage = signal<string | null>(null);
  readonly voteError = signal(false);

  // ── Computed ────────────────────────────────────────────────────────

  readonly votedCount = computed(() => this.seats().filter(s => s.has_voted).length);
  readonly totalSeats = computed(() => this.seats().length);
  readonly pendingCount = computed(() => this.totalSeats() - this.votedCount());

  readonly votingProgress = computed(() => {
    const total = this.totalSeats();
    return total > 0 ? Math.round((this.votedCount() / total) * 100) : 0;
  });

  /** Stroke-dasharray value for the voted arc of the SVG pie ring. */
  readonly pieVoted = computed(() => {
    const total = this.totalSeats();
    const circumference = 2 * Math.PI * 80;
    return total > 0 ? (this.votedCount() / total) * circumference : 0;
  });

  readonly pieTotal = computed(() => 2 * Math.PI * 80);

  // ── Lifecycle ──────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadSeats();
  }

  // ── Public helpers ─────────────────────────────────────────────────

  /** Return an emoji icon for a seat type (prefer DB value, then fallback). */
  seatIcon(seat: Seat): string {
    return seat.icon ?? SEAT_ICONS[seat.seat_type] ?? '🗳️';
  }

  loadSeats(): void {
    this.loading.set(true);
    this.error.set(null);
    this.votingService.getSeats().subscribe({
      next: seats => {
        this.seats.set(seats);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load seats. Please try again.');
        this.loading.set(false);
      },
    });
  }

  // ── Voting flow ────────────────────────────────────────────────────

  openVoting(seat: Seat): void {
    this.activeSeat.set(seat);
    this.selectedCandidate.set(null);
    this.voteMessage.set(null);
    this.voteError.set(false);
    this.loadingCandidates.set(true);

    this.votingService.getCandidates(seat.id).subscribe({
      next: candidates => {
        this.candidates.set(candidates);
        this.loadingCandidates.set(false);
      },
      error: () => {
        this.candidates.set([]);
        this.loadingCandidates.set(false);
      },
    });
  }

  closeVoting(): void {
    this.activeSeat.set(null);
    this.candidates.set([]);
    this.selectedCandidate.set(null);
    this.voteMessage.set(null);
    this.voteError.set(false);
  }

  selectCandidate(candidate: Candidate): void {
    this.selectedCandidate.set(candidate);
  }

  confirmVote(): void {
    const seat = this.activeSeat();
    const candidate = this.selectedCandidate();
    if (!seat || !candidate) return;

    this.submitting.set(true);
    this.voteMessage.set(null);
    this.voteError.set(false);

    this.votingService.submitVote(seat.id, candidate.id).subscribe({
      next: res => {
        this.submitting.set(false);
        this.voteMessage.set(res.message);
        this.voteError.set(false);
        // Reflect the change locally so the card flips to "Voted".
        this.seats.update(all =>
          all.map(s => (s.id === seat.id ? { ...s, has_voted: true } : s)),
        );
      },
      error: err => {
        this.submitting.set(false);
        this.voteMessage.set(
          err.error?.detail ?? 'Vote failed. Please try again.',
        );
        this.voteError.set(true);
      },
    });
  }

  // ── Navigation ─────────────────────────────────────────────────────

  goTo(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}