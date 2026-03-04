import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer, switchMap, catchError, EMPTY } from 'rxjs';
import { AuthService } from '../../services/auth';
import {
  VotingService,
  VoteResult,
  ResultFilters,
} from '../../services/voting';

/** Seat-level icon fallbacks. */
const SEAT_ICONS: Record<string, string> = {
  president: '🇰🇪',
  governor: '🏛️',
  senator: '⚖️',
  mp: '📋',
  woman_rep: '👩',
  mca: '🏘️',
};

/** One group shown in the template – a seat with its sorted candidates. */
export interface SeatGroup {
  seatId: number;
  seatName: string;
  seatType: string;
  seatLevel: string;
  icon: string;
  totalVotes: number;
  candidates: {
    candidateId: number;
    name: string;
    party: string | null;
    photoUrl: string | null;
    votes: number;
    percentage: number;
  }[];
}

/** How often (ms) the results auto-refresh. */
const POLL_INTERVAL = 30_000;

@Component({
  selector: 'app-results',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './results.html',
  styleUrl: './results.css',
})
export class ResultsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly votingService = inject(VotingService);
  private readonly destroyRef = inject(DestroyRef);

  // ── State signals ──────────────────────────────────────────────────

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly seatGroups = signal<SeatGroup[]>([]);
  readonly activeFilter = signal<ResultFilters>({});

  /** Available seat-type options for the filter bar. */
  readonly seatTypes: { value: string; label: string }[] = [
    { value: '', label: 'All Seats' },
    { value: 'president', label: 'President' },
    { value: 'governor', label: 'Governor' },
    { value: 'senator', label: 'Senator' },
    { value: 'mp', label: 'MP' },
    { value: 'woman_rep', label: 'Woman Rep' },
    { value: 'mca', label: 'MCA' },
  ];

  // ── Computed ────────────────────────────────────────────────────────

  readonly totalVotesAllSeats = computed(() =>
    this.seatGroups().reduce((sum, g) => sum + g.totalVotes, 0),
  );

  readonly totalCandidates = computed(() =>
    this.seatGroups().reduce((sum, g) => sum + g.candidates.length, 0),
  );

  // ── Lifecycle ──────────────────────────────────────────────────────

  ngOnInit(): void {
    this.startPolling();
  }

  // ── Polling ────────────────────────────────────────────────────────

  /**
   * Fires immediately (0), then every 30 s.
   * Each tick calls getResults() with the active filter.
   * Automatically unsubscribed when the component is destroyed.
   */
  private startPolling(): void {
    timer(0, POLL_INTERVAL)
      .pipe(
        switchMap(() => {
          // Only show the full-page spinner on the very first load.
          return this.votingService.getResults(this.activeFilter()).pipe(
            catchError(() => {
              this.error.set('Failed to load results.');
              this.loading.set(false);
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(results => {
        this.seatGroups.set(this.groupBySeat(results));
        this.loading.set(false);
        this.error.set(null);
      });
  }

  // ── Public helpers ─────────────────────────────────────────────────

  onFilterChange(seatType: string): void {
    this.activeFilter.set(seatType ? { seat_type: seatType } : {});
    this.loading.set(true);
    // Restart polling with the new filter.
    this.startPolling();
  }

  goTo(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  // ── Private ────────────────────────────────────────────────────────

  private groupBySeat(flat: VoteResult[]): SeatGroup[] {
    const map = new Map<number, SeatGroup>();

    for (const r of flat) {
      let group = map.get(r.seat_id);
      if (!group) {
        group = {
          seatId: r.seat_id,
          seatName: r.seat_name,
          seatType: r.seat_type,
          seatLevel: r.seat_level,
          icon: SEAT_ICONS[r.seat_type] ?? '🗳️',
          totalVotes: 0,
          candidates: [],
        };
        map.set(r.seat_id, group);
      }
      group.totalVotes += r.vote_count;
      group.candidates.push({
        candidateId: r.candidate_id,
        name: r.candidate_name,
        party: r.party,
        photoUrl: r.photo_url,
        votes: r.vote_count,
        percentage: 0,
      });
    }

    // Compute percentages now that totals are known.
    for (const group of map.values()) {
      for (const c of group.candidates) {
        c.percentage =
          group.totalVotes > 0
            ? Math.round((c.votes / group.totalVotes) * 100)
            : 0;
      }
    }

    return [...map.values()];
  }
}