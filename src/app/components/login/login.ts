import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { VotingService } from '../../services/voting';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-black via-red-900 to-green-900 flex items-center justify-center p-6">
      @if (loading()) {
        <div class="fixed inset-0 bg-black/90 backdrop-blur flex items-center justify-center z-50">
          <div class="text-center">
            <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p class="text-white text-xl">Logging in...</p>
          </div>
        </div>
      }

      <div class="max-w-md w-full">
        <button (click)="goBack()" class="mb-6 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700">
          ← Back to Home
        </button>

        <div class="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-10 border-2 border-green-600">
          <div class="text-6xl text-center mb-6">🔑</div>
          <h2 class="text-3xl font-bold text-white mb-6 text-center">Voter Login</h2>

          <form [formGroup]="form" (ngSubmit)="login()" class="space-y-4">
            <div>
              <label for="idNumber" class="block text-white font-bold mb-2">ID Number</label>
              <input id="idNumber"
                formControlName="idNumber"
                maxlength="8"
                class="w-full px-5 py-4 bg-white/5 border-2 border-white/10 rounded-lg text-white focus:outline-none focus:border-green-600"
                placeholder="National ID Number"/>
              @if (form.controls.idNumber.touched && form.controls.idNumber.errors) {
                <p class="text-red-400 text-sm mt-2">
                  @if (form.controls.idNumber.errors['required']) { ID number is required }
                  @else if (form.controls.idNumber.errors['pattern']) { Must be 7-8 digits }
                </p>
              }
            </div>

            <div>
              <label for="password" class="block text-white font-bold mb-2">Password</label>
              <input id="password"
                formControlName="password"
                type="password"
                class="w-full px-5 py-4 bg-white/5 border-2 border-white/10 rounded-lg text-white focus:outline-none focus:border-green-600"
                placeholder="Password"/>
              @if (form.controls.password.touched && form.controls.password.errors) {
                <p class="text-red-400 text-sm mt-2">Password is required</p>
              }
            </div>

            @if (errorMessage()) {
              <p class="text-red-400 text-sm text-center">{{ errorMessage() }}</p>
            }

            <button
              type="submit"
              [disabled]="form.invalid"
              [class]="'w-full py-4 text-white font-bold text-xl rounded-lg ' +
                       (form.invalid ? 'bg-gray-700 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800')">
              Login
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-gray-400 mb-2">Don't have an account?</p>
            <button (click)="goToRegister()" class="text-red-400 hover:text-red-300 font-bold">
              Register Now
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class LoginComponent {
  private readonly votingService = inject(VotingService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    idNumber: ['', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
    password: ['', Validators.required],
  });

  loading = signal(false);
  errorMessage = signal('');

  login(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { idNumber, password } = this.form.getRawValue();

    this.votingService.loginVoter({ id_number: idNumber, password }).subscribe({
      next: (response: any) => {
        this.loading.set(false);
        this.authService.handleLoginResponse(response);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Invalid credentials. Please check your ID number and password.');
      },
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}