import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { VotingService } from '../../services/voting';

@Component({
  selector: 'app-registration',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-black to-gray-900 p-6">
      <!-- Loading -->
      @if (loading()) {
        <div class="fixed inset-0 bg-black/90 backdrop-blur flex items-center justify-center z-50">
          <div class="text-center">
            <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p class="text-white text-xl">Registering voter...</p>
          </div>
        </div>
      }

      <!-- Success Modal -->
      @if (showSuccess()) {
        <div class="fixed inset-0 bg-black/90 backdrop-blur flex items-center justify-center z-50 p-4">
          <div class="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-10 max-w-md border-2 border-green-600">
            <div class="text-center">
              <div class="text-6xl mb-6 animate-bounce">✅</div>
              <h3 class="text-3xl font-bold text-white mb-4">Registration Successful!</h3>
              <div class="bg-white/10 rounded-xl p-6 mb-6">
                <p class="text-sm text-gray-400 mb-2">Your Voter Code</p>
                <p class="text-4xl font-mono font-bold text-green-400 tracking-wider">{{ voterCode() }}</p>
              </div>
              <p class="text-red-400 text-sm mb-6">⚠️ Write this down! You cannot recover it later.</p>
              <button (click)="goToLogin()" class="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-lg">
                Continue to Login
              </button>
            </div>
          </div>
        </div>
      }

      <div class="max-w-3xl mx-auto">
        <button (click)="goBack()" class="mb-6 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700">
          ← Back to Home
        </button>

        <h2 class="text-5xl font-bold text-white mb-8 text-center">Voter Registration</h2>

        <div class="bg-gray-900 rounded-2xl p-10 border-2 border-white/20">
          <form [formGroup]="form" (ngSubmit)="register()" class="space-y-6">
            <!-- Full Name -->
            <div>
              <label for="fullName" class="block text-white font-bold mb-2">Full Name</label>
              <input id="fullName"
                formControlName="fullName"
                [class]="'w-full px-5 py-4 bg-white/5 border-2 rounded-lg text-white focus:outline-none ' +
                         (form.controls.fullName.touched && form.controls.fullName.invalid ? 'border-red-500' : form.controls.fullName.valid && form.controls.fullName.value ? 'border-green-500' : 'border-white/10')"
                placeholder="As per ID"/>
              @if (form.controls.fullName.touched && form.controls.fullName.errors) {
                <p class="text-red-400 text-sm mt-2">
                  @if (form.controls.fullName.errors['required']) { Full name is required }
                  @else if (form.controls.fullName.errors['pattern']) { Letters only }
                </p>
              }
            </div>

            <!-- ID Number -->
            <div>
              <label for="idNumber" class="block text-white font-bold mb-2">ID Number</label>
              <input id="idNumber"
                formControlName="idNumber"
                maxlength="8"
                [class]="'w-full px-5 py-4 bg-white/5 border-2 rounded-lg text-white focus:outline-none ' +
                         (form.controls.idNumber.touched && form.controls.idNumber.invalid ? 'border-red-500' : form.controls.idNumber.valid && form.controls.idNumber.value ? 'border-green-500' : 'border-white/10')"
                placeholder="12345678"/>
              @if (form.controls.idNumber.touched && form.controls.idNumber.errors) {
                <p class="text-red-400 text-sm mt-2">
                  @if (form.controls.idNumber.errors['required']) { ID number is required }
                  @else if (form.controls.idNumber.errors['pattern']) { Must be 7-8 digits }
                </p>
              }
            </div>

            <!-- Location Selects -->
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label for="county" class="block text-white font-bold mb-2">County</label>
                <select id="county"
                  formControlName="county"
                  (change)="onCountyChange()"
                  class="w-full px-5 py-4 bg-white/5 border-2 border-white/10 rounded-lg text-white">
                  <option value="" style="color:black">Select</option>
                  @for (county of counties; track county.id) {
                    <option [value]="county.id" style="color:black">{{ county.name }}</option>
                  }
                </select>
                @if (form.controls.county.touched && form.controls.county.errors) {
                  <p class="text-red-400 text-sm mt-2">County is required</p>
                }
              </div>

              <div>
                <label for="constituency" class="block text-white font-bold mb-2">Constituency</label>
                <select id="constituency"
                  formControlName="constituency"
                  (change)="onConstituencyChange()"
                  class="w-full px-5 py-4 bg-white/5 border-2 border-white/10 rounded-lg text-white">
                  <option value="" style="color:black">Select</option>
                  @for (c of filteredConstituencies(); track c.id) {
                    <option [value]="c.id" style="color:black">{{ c.name }}</option>
                  }
                </select>
                @if (form.controls.constituency.touched && form.controls.constituency.errors) {
                  <p class="text-red-400 text-sm mt-2">Constituency is required</p>
                }
              </div>

              <div>
                <label for="ward" class="block text-white font-bold mb-2">Ward</label>
                <select id="ward"
                  formControlName="ward"
                  class="w-full px-5 py-4 bg-white/5 border-2 border-white/10 rounded-lg text-white">
                  <option value="" style="color:black">Select</option>
                  @for (w of filteredWards(); track w.id) {
                    <option [value]="w.id" style="color:black">{{ w.name }}</option>
                  }
                </select>
                @if (form.controls.ward.touched && form.controls.ward.errors) {
                  <p class="text-red-400 text-sm mt-2">Ward is required</p>
                }
              </div>
            </div>

            <!-- Phone -->
            <div>
              <label for="phone" class="block text-white font-bold mb-2">Phone</label>
              <input id="phone"
                formControlName="phone"
                [class]="'w-full px-5 py-4 bg-white/5 border-2 rounded-lg text-white focus:outline-none ' +
                         (form.controls.phone.touched && form.controls.phone.invalid ? 'border-red-500' : 'border-white/10')"
                placeholder="+254700000000"/>
              @if (form.controls.phone.touched && form.controls.phone.errors) {
                <p class="text-red-400 text-sm mt-2">
                  @if (form.controls.phone.errors['required']) { Phone number is required }
                  @else if (form.controls.phone.errors['pattern']) { Invalid format (e.g. +254712345678) }
                </p>
              }
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-white font-bold mb-2">Email <span class="text-gray-500 font-normal">(optional)</span></label>
              <input id="email"
                formControlName="email"
                type="email"
                [class]="'w-full px-5 py-4 bg-white/5 border-2 rounded-lg text-white focus:outline-none ' +
                         (form.controls.email.touched && form.controls.email.invalid ? 'border-red-500' : 'border-white/10')"
                placeholder="voter@example.com"/>
              @if (form.controls.email.touched && form.controls.email.errors) {
                <p class="text-red-400 text-sm mt-2">Enter a valid email address</p>
              }
            </div>

            <!-- Password -->
            <div>
              <label for="password" class="block text-white font-bold mb-2">Password</label>
              <input id="password"
                formControlName="password"
                type="password"
                [class]="'w-full px-5 py-4 bg-white/5 border-2 rounded-lg text-white focus:outline-none ' +
                         (form.controls.password.touched && form.controls.password.invalid ? 'border-red-500' : form.controls.password.valid && form.controls.password.value ? 'border-green-500' : 'border-white/10')"
                placeholder="Min 6 characters"/>
              @if (form.controls.password.touched && form.controls.password.errors) {
                <p class="text-red-400 text-sm mt-2">
                  @if (form.controls.password.errors['required']) { Password is required }
                  @else if (form.controls.password.errors['minlength']) { Must be at least 6 characters }
                </p>
              }
            </div>

            <button
              type="submit"
              [disabled]="form.invalid"
              [class]="'w-full py-5 text-white font-bold text-xl rounded-lg ' +
                       (form.invalid ? 'bg-gray-700 cursor-not-allowed' : 'bg-gradient-to-r from-red-700 via-black to-green-700 hover:opacity-90')">
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RegistrationComponent {
  private votingService = inject(VotingService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]],
    idNumber: ['', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
    phone:    ['+254', [Validators.required, Validators.pattern(/^\+254\d{9}$/)]],
    county:       ['', Validators.required],
    constituency: ['', Validators.required],
    ward:         ['', Validators.required],
    email:    [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });
  counties: any[]  = [
  { id: 1, name: 'Mombasa' },
  { id: 2, name: 'Kwale' },
  { id: 3, name: 'Kilifi' },
  { id: 4, name: 'Tana River' },
  { id: 5, name: 'Lamu' },
  { id: 6, name: 'Taita-Taveta' },
  { id: 7, name: 'Garissa' },
  { id: 8, name: 'Wajir' },
  { id: 9, name: 'Mandera' },
  { id: 10, name: 'Marsabit' },
  { id: 11, name: 'Isiolo' },
  { id: 12, name: 'Meru' },
  { id: 13, name: 'Tharaka-Nithi' },
  { id: 14, name: 'Embu' },
  { id: 15, name: 'Kitui' },
  { id: 16, name: 'Machakos' },
  { id: 17, name: 'Makueni' },
  { id: 18, name: 'Nyandarua' },
  { id: 19, name: 'Nyeri' },
  { id: 20, name: 'Kirinyaga' },
  { id: 21, name: 'Murang\'a' },
  { id: 22, name: 'Kiambu' },
  { id: 23, name: 'Turkana' },
  { id: 24, name: 'West Pokot' },
  { id: 25, name: 'Samburu' },
  { id: 26, name: 'Trans Nzoia' },
  { id: 27, name: 'Uasin Gishu' },
  { id: 28, name: 'Elgeyo-Marakwet' },
  { id: 29, name: 'Nandi' },
  { id: 30, name: 'Baringo' },
  { id: 31, name: 'Laikipia' },
  { id: 32, name: 'Nakuru' },
  { id: 33, name: 'Narok' },
  { id: 34, name: 'Kajiado' },
  { id: 35, name: 'Kericho' },
  { id: 36, name: 'Bomet' },
  { id: 37, name: 'Kakamega' },
  { id: 38, name: 'Vihiga' },
  { id: 39, name: 'Bungoma' },
  { id: 40, name: 'Busia' },
  { id: 41, name: 'Siaya' },
  { id: 42, name: 'Kisumu' },
  { id: 43, name: 'Homa Bay' },
  { id: 44, name: 'Migori' },
  { id: 45, name: 'Kisii' },
  { id: 46, name: 'Nyamira' },
  { id: 47, name: 'Nairobi City' }
];

filteredConstituencies =signal<any[]>([])
  constituencies =signal<any[]>([
  // Mombasa (1)
  { id: 1, name: 'Changamwe', countyId: 1 },
  { id: 2, name: 'Jomvu', countyId: 1 },
  { id: 3, name: 'Kisauni', countyId: 1 },
  { id: 4, name: 'Nyali', countyId: 1 },
  { id: 5, name: 'Likoni', countyId: 1 },
  { id: 6, name: 'Mvita', countyId: 1 },

  // Kwale (2)
  { id: 7, name: 'Msambweni', countyId: 2 },
  { id: 8, name: 'Lunga Lunga', countyId: 2 },
  { id: 9, name: 'Matuga', countyId: 2 },
  { id: 10, name: 'Kinango', countyId: 2 },

  // Kilifi (3)
  { id: 11, name: 'Kilifi North', countyId: 3 },
  { id: 12, name: 'Kilifi South', countyId: 3 },
  { id: 13, name: 'Kaloleni', countyId: 3 },
  { id: 14, name: 'Rabai', countyId: 3 },
  { id: 15, name: 'Ganze', countyId: 3 },
  { id: 16, name: 'Malindi', countyId: 3 },
  { id: 17, name: 'Magarini', countyId: 3 },

  // Tana River (4)
  { id: 18, name: 'Garsen', countyId: 4 },
  { id: 19, name: 'Galole', countyId: 4 },
  { id: 20, name: 'Bura', countyId: 4 },

  // Lamu (5)
  { id: 21, name: 'Lamu East', countyId: 5 },
  { id: 22, name: 'Lamu West', countyId: 5 },

  // Taita-Taveta (6)
  { id: 23, name: 'Taveta', countyId: 6 },
  { id: 24, name: 'Wundanyi', countyId: 6 },
  { id: 25, name: 'Mwatate', countyId: 6 },
  { id: 26, name: 'Voi', countyId: 6 },

  // Garissa (7)
  { id: 27, name: 'Garissa Township', countyId: 7 },
  { id: 28, name: 'Balambala', countyId: 7 },
  { id: 29, name: 'Lagdera', countyId: 7 },
  { id: 30, name: 'Dadaab', countyId: 7 },
  { id: 31, name: 'Fafi', countyId: 7 },
  { id: 32, name: 'Ijara', countyId: 7 },

  // Wajir (8)
  { id: 33, name: 'Wajir North', countyId: 8 },
  { id: 34, name: 'Wajir East', countyId: 8 },
  { id: 35, name: 'Tarbaj', countyId: 8 },
  { id: 36, name: 'Wajir West', countyId: 8 },
  { id: 37, name: 'Eldas', countyId: 8 },
  { id: 38, name: 'Wajir South', countyId: 8 },

  // Mandera (9)
  { id: 39, name: 'Mandera West', countyId: 9 },
  { id: 40, name: 'Banissa', countyId: 9 },
  { id: 41, name: 'Mandera North', countyId: 9 },
  { id: 42, name: 'Mandera South', countyId: 9 },
  { id: 43, name: 'Mandera East', countyId: 9 },
  { id: 44, name: 'Lafey', countyId: 9 },

  // Marsabit (10)
  { id: 45, name: 'Moyale', countyId: 10 },
  { id: 46, name: 'North Horr', countyId: 10 },
  { id: 47, name: 'Saku', countyId: 10 },
  { id: 48, name: 'Laisamis', countyId: 10 },

  // Isiolo (11)
  { id: 49, name: 'Isiolo North', countyId: 11 },
  { id: 50, name: 'Isiolo South', countyId: 11 },

  // Meru (12)
  { id: 51, name: 'Igembe South', countyId: 12 },
  { id: 52, name: 'Igembe Central', countyId: 12 },
  { id: 53, name: 'Igembe North', countyId: 12 },
  { id: 54, name: 'Tigania West', countyId: 12 },
  { id: 55, name: 'Tigania East', countyId: 12 },
  { id: 56, name: 'North Imenti', countyId: 12 },
  { id: 57, name: 'Buuri', countyId: 12 },
  { id: 58, name: 'Central Imenti', countyId: 12 },
  { id: 59, name: 'South Imenti', countyId: 12 },

  // Tharaka-Nithi (13)
  { id: 60, name: 'Maara', countyId: 13 },
  { id: 61, name: 'Chuka/Igambang\'ombe', countyId: 13 },
  { id: 62, name: 'Tharaka', countyId: 13 },

  // Embu (14)
  { id: 63, name: 'Manyatta', countyId: 14 },
  { id: 64, name: 'Runyenjes', countyId: 14 },
  { id: 65, name: 'Mbeere South', countyId: 14 },
  { id: 66, name: 'Mbeere North', countyId: 14 },

  // Kitui (15)
  { id: 67, name: 'Mwingi North', countyId: 15 },
  { id: 68, name: 'Mwingi West', countyId: 15 },
  { id: 69, name: 'Mwingi Central', countyId: 15 },
  { id: 70, name: 'Kitui West', countyId: 15 },
  { id: 71, name: 'Kitui Rural', countyId: 15 },
  { id: 72, name: 'Kitui Central', countyId: 15 },
  { id: 73, name: 'Kitui East', countyId: 15 },
  { id: 74, name: 'Kitui South', countyId: 15 },

  // Machakos (16)
  { id: 75, name: 'Masinga', countyId: 16 },
  { id: 76, name: 'Yatta', countyId: 16 },
  { id: 77, name: 'Kangundo', countyId: 16 },
  { id: 78, name: 'Matungulu', countyId: 16 },
  { id: 79, name: 'Kathiani', countyId: 16 },
  { id: 80, name: 'Mavoko', countyId: 16 },
  { id: 81, name: 'Machakos Town', countyId: 16 },
  { id: 82, name: 'Mwala', countyId: 16 },

  // Makueni (17)
  { id: 83, name: 'Mbooni', countyId: 17 },
  { id: 84, name: 'Kilome', countyId: 17 },
  { id: 85, name: 'Kaiti', countyId: 17 },
  { id: 86, name: 'Makueni', countyId: 17 },
  { id: 87, name: 'Kibwezi East', countyId: 17 },
  { id: 88, name: 'Kibwezi West', countyId: 17 },

  // Nyandarua (18)
  { id: 89, name: 'Kinangop', countyId: 18 },
  { id: 90, name: 'Kipipiri', countyId: 18 },
  { id: 91, name: 'Ol Kalou', countyId: 18 },
  { id: 92, name: 'Ol Jorok', countyId: 18 },

  // Nyeri (19)
  { id: 93, name: 'Tetu', countyId: 19 },
  { id: 94, name: 'Kieni', countyId: 19 },
  { id: 95, name: 'Mathira', countyId: 19 },
  { id: 96, name: 'Othaya', countyId: 19 },
  { id: 97, name: 'Mukurweini', countyId: 19 },
  { id: 98, name: 'Nyeri Town', countyId: 19 },

  // Kirinyaga (20)
  { id: 99, name: 'Mwea', countyId: 20 },
  { id: 100, name: 'Gichugu', countyId: 20 },
  { id: 101, name: 'Ndia', countyId: 20 },
  { id: 102, name: 'Kirinyaga Central', countyId: 20 },

  // Murang'a (21)
  { id: 103, name: 'Kangema', countyId: 21 },
  { id: 104, name: 'Mathioya', countyId: 21 },
  { id: 105, name: 'Kiharu', countyId: 21 },
  { id: 106, name: 'Kigumo', countyId: 21 },
  { id: 107, name: 'Maragwa', countyId: 21 },
  { id: 108, name: 'Kandara', countyId: 21 },

  // Kiambu (22)
  { id: 109, name: 'Gatundu South', countyId: 22 },
  { id: 110, name: 'Gatundu North', countyId: 22 },
  { id: 111, name: 'Juja', countyId: 22 },
  { id: 112, name: 'Thika Town', countyId: 22 },
  { id: 113, name: 'Ruiru', countyId: 22 },
  { id: 114, name: 'Githunguri', countyId: 22 },
  { id: 115, name: 'Kiambu', countyId: 22 },
  { id: 116, name: 'Kiambaa', countyId: 22 },
  { id: 117, name: 'Kabete', countyId: 22 },
  { id: 118, name: 'Kikuyu', countyId: 22 },
  { id: 119, name: 'Limuru', countyId: 22 },
  { id: 120, name: 'Lari', countyId: 22 },

  // Turkana (23)
  { id: 121, name: 'Turkana North', countyId: 23 },
  { id: 122, name: 'Turkana West', countyId: 23 },
  { id: 123, name: 'Turkana Central', countyId: 23 },
  { id: 124, name: 'Loima', countyId: 23 },
  { id: 125, name: 'Turkana South', countyId: 23 },
  { id: 126, name: 'Turkana East', countyId: 23 },

  // West Pokot (24)
  { id: 127, name: 'Kapenguria', countyId: 24 },
  { id: 128, name: 'Sigor', countyId: 24 },
  { id: 129, name: 'Kacheliba', countyId: 24 },
  { id: 130, name: 'Pokot South', countyId: 24 },

  // Samburu (25)
  { id: 131, name: 'Samburu West', countyId: 25 },
  { id: 132, name: 'Samburu North', countyId: 25 },
  { id: 133, name: 'Samburu East', countyId: 25 },

  // Trans Nzoia (26)
  { id: 134, name: 'Kwanza', countyId: 26 },
  { id: 135, name: 'Endebess', countyId: 26 },
  { id: 136, name: 'Saboti', countyId: 26 },
  { id: 137, name: 'Kiminini', countyId: 26 },
  { id: 138, name: 'Cherangany', countyId: 26 },

  // Uasin Gishu (27)
  { id: 139, name: 'Soy', countyId: 27 },
  { id: 140, name: 'Turbo', countyId: 27 },
  { id: 141, name: 'Moiben', countyId: 27 },
  { id: 142, name: 'Ainabkoi', countyId: 27 },
  { id: 143, name: 'Kapseret', countyId: 27 },
  { id: 144, name: 'Kesses', countyId: 27 },

  // Elgeyo-Marakwet (28)
  { id: 145, name: 'Marakwet East', countyId: 28 },
  { id: 146, name: 'Marakwet West', countyId: 28 },
  { id: 147, name: 'Keiyo North', countyId: 28 },
  { id: 148, name: 'Keiyo South', countyId: 28 },

  // Nandi (29)
  { id: 149, name: 'Tinderet', countyId: 29 },
  { id: 150, name: 'Aldai', countyId: 29 },
  { id: 151, name: 'Nandi Hills', countyId: 29 },
  { id: 152, name: 'Chesumei', countyId: 29 },
  { id: 153, name: 'Emgwen', countyId: 29 },
  { id: 154, name: 'Mosop', countyId: 29 },

  // Baringo (30)
  { id: 155, name: 'Tiaty', countyId: 30 },
  { id: 156, name: 'Baringo North', countyId: 30 },
  { id: 157, name: 'Baringo Central', countyId: 30 },
  { id: 158, name: 'Baringo South', countyId: 30 },
  { id: 159, name: 'Mogotio', countyId: 30 },
  { id: 160, name: 'Eldama Ravine', countyId: 30 },

  // Laikipia (31)
  { id: 161, name: 'Laikipia West', countyId: 31 },
  { id: 162, name: 'Laikipia East', countyId: 31 },
  { id: 163, name: 'Laikipia North', countyId: 31 },

  // Nakuru (32)
  { id: 164, name: 'Molo', countyId: 32 },
  { id: 165, name: 'Njoro', countyId: 32 },
  { id: 166, name: 'Naivasha', countyId: 32 },
  { id: 167, name: 'Gilgil', countyId: 32 },
  { id: 168, name: 'Kuresoi South', countyId: 32 },
  { id: 169, name: 'Kuresoi North', countyId: 32 },
  { id: 170, name: 'Subukia', countyId: 32 },
  { id: 171, name: 'Rongai', countyId: 32 },
  { id: 172, name: 'Bahati', countyId: 32 },
  { id: 173, name: 'Nakuru Town West', countyId: 32 },
  { id: 174, name: 'Nakuru Town East', countyId: 32 },

  // Narok (33)
  { id: 175, name: 'Kilgoris', countyId: 33 },
  { id: 176, name: 'Emurua Dikirr', countyId: 33 },
  { id: 177, name: 'Narok North', countyId: 33 },
  { id: 178, name: 'Narok East', countyId: 33 },
  { id: 179, name: 'Narok South', countyId: 33 },
  { id: 180, name: 'Narok West', countyId: 33 },

  // Kajiado (34)
  { id: 181, name: 'Kajiado North', countyId: 34 },
  { id: 182, name: 'Kajiado Central', countyId: 34 },
  { id: 183, name: 'Kajiado East', countyId: 34 },
  { id: 184, name: 'Kajiado West', countyId: 34 },
  { id: 185, name: 'Kajiado South', countyId: 34 },

  // Kericho (35)
  { id: 186, name: 'Ainamoi', countyId: 35 },
  { id: 187, name: 'Belgut', countyId: 35 },
  { id: 188, name: 'Sigowet/Soin', countyId: 35 },
  { id: 189, name: 'Kipkelion East', countyId: 35 },
  { id: 190, name: 'Kipkelion West', countyId: 35 },

  // Bomet (36)
  { id: 191, name: 'Sotik', countyId: 36 },
  { id: 192, name: 'Chepalungu', countyId: 36 },
  { id: 193, name: 'Bomet East', countyId: 36 },
  { id: 194, name: 'Bomet Central', countyId: 36 },
  { id: 195, name: 'Konoin', countyId: 36 },

  // Kakamega (37)
  { id: 196, name: 'Lugari', countyId: 37 },
  { id: 197, name: 'Likuyani', countyId: 37 },
  { id: 198, name: 'Malava', countyId: 37 },
  { id: 199, name: 'Lurambi', countyId: 37 },
  { id: 200, name: 'Navakholo', countyId: 37 },
  { id: 201, name: 'Mumias West', countyId: 37 },
  { id: 202, name: 'Mumias East', countyId: 37 },
  { id: 203, name: 'Matungu', countyId: 37 },
  { id: 204, name: 'Butere', countyId: 37 },
  { id: 205, name: 'Khwisero', countyId: 37 },
  { id: 206, name: 'Shinyalu', countyId: 37 },
  { id: 207, name: 'Ikolomani', countyId: 37 },

  // Vihiga (38)
  { id: 208, name: 'Vihiga', countyId: 38 },
  { id: 209, name: 'Sabatia', countyId: 38 },
  { id: 210, name: 'Hamisi', countyId: 38 },
  { id: 211, name: 'Luanda', countyId: 38 },
  { id: 212, name: 'Emuhaya', countyId: 38 },

  // Bungoma (39)
  { id: 213, name: 'Mt. Elgon', countyId: 39 },
  { id: 214, name: 'Sirisia', countyId: 39 },
  { id: 215, name: 'Kabuchai', countyId: 39 },
  { id: 216, name: 'Bumula', countyId: 39 },
  { id: 217, name: 'Kanduyi', countyId: 39 },
  { id: 218, name: 'Webuye East', countyId: 39 },
  { id: 219, name: 'Webuye West', countyId: 39 },
  { id: 220, name: 'Kimilili', countyId: 39 },
  { id: 221, name: 'Tongaren', countyId: 39 },

  // Busia (40)
  { id: 222, name: 'Teso North', countyId: 40 },
  { id: 223, name: 'Teso South', countyId: 40 },
  { id: 224, name: 'Nambale', countyId: 40 },
  { id: 225, name: 'Matayos', countyId: 40 },
  { id: 226, name: 'Butula', countyId: 40 },
  { id: 227, name: 'Funyula', countyId: 40 },
  { id: 228, name: 'Budalangi', countyId: 40 },

  // Siaya (41)
  { id: 229, name: 'Ugenya', countyId: 41 },
  { id: 230, name: 'Ugunja', countyId: 41 },
  { id: 231, name: 'Alego Usonga', countyId: 41 },
  { id: 232, name: 'Gem', countyId: 41 },
  { id: 233, name: 'Bondo', countyId: 41 },
  { id: 234, name: 'Rarieda', countyId: 41 },

  // Kisumu (42)
  { id: 235, name: 'Kisumu East', countyId: 42 },
  { id: 236, name: 'Kisumu West', countyId: 42 },
  { id: 237, name: 'Kisumu Central', countyId: 42 },
  { id: 238, name: 'Seme', countyId: 42 },
  { id: 239, name: 'Nyando', countyId: 42 },
  { id: 240, name: 'Muhoroni', countyId: 42 },
  { id: 241, name: 'Nyakach', countyId: 42 },

  // Homa Bay (43)
  { id: 242, name: 'Kasipul', countyId: 43 },
  { id: 243, name: 'Kabondo Kasipul', countyId: 43 },
  { id: 244, name: 'Karachuonyo', countyId: 43 },
  { id: 245, name: 'Rangwe', countyId: 43 },
  { id: 246, name: 'Homa Bay Town', countyId: 43 },
  { id: 247, name: 'Ndhiwa', countyId: 43 },
  { id: 248, name: 'Mbita', countyId: 43 },
  { id: 249, name: 'Suba', countyId: 43 },

  // Migori (44)
  { id: 250, name: 'Rongo', countyId: 44 },
  { id: 251, name: 'Awendo', countyId: 44 },
  { id: 252, name: 'Suna East', countyId: 44 },
  { id: 253, name: 'Suna West', countyId: 44 },
  { id: 254, name: 'Uriri', countyId: 44 },
  { id: 255, name: 'Nyatike', countyId: 44 },
  { id: 256, name: 'Kuria West', countyId: 44 },
  { id: 257, name: 'Kuria East', countyId: 44 },

  // Kisii (45)
  { id: 258, name: 'Bonchari', countyId: 45 },
  { id: 259, name: 'South Mugirango', countyId: 45 },
  { id: 260, name: 'Bomachoge Borabu', countyId: 45 },
  { id: 261, name: 'Bobasi', countyId: 45 },
  { id: 262, name: 'Bomachoge Chache', countyId: 45 },
  { id: 263, name: 'Nyaribari Masaba', countyId: 45 },
  { id: 264, name: 'Nyaribari Chache', countyId: 45 },
  { id: 265, name: 'Kitutu Chache North', countyId: 45 },
  { id: 266, name: 'Kitutu Chache South', countyId: 45 },

  // Nyamira (46)
  { id: 267, name: 'Kitutu Masaba', countyId: 46 },
  { id: 268, name: 'West Mugirango', countyId: 46 },
  { id: 269, name: 'North Mugirango', countyId: 46 },
  { id: 270, name: 'Borabu', countyId: 46 },

  // Nairobi City (47)
  { id: 271, name: 'Westlands', countyId: 47 },
  { id: 272, name: 'Dagoretti North', countyId: 47 },
  { id: 273, name: 'Dagoretti South', countyId: 47 },
  { id: 274, name: 'Lang\'ata', countyId: 47 },
  { id: 275, name: 'Kibra', countyId: 47 },
  { id: 276, name: 'Roysambu', countyId: 47 },
  { id: 277, name: 'Kasarani', countyId: 47 },
  { id: 278, name: 'Ruaraka', countyId: 47 },
  { id: 279, name: 'Embakasi South', countyId: 47 },
  { id: 280, name: 'Embakasi North', countyId: 47 },
  { id: 281, name: 'Embakasi Central', countyId: 47 },
  { id: 282, name: 'Embakasi East', countyId: 47 },
  { id: 283, name: 'Embakasi West', countyId: 47 },
  { id: 284, name: 'Makadara', countyId: 47 },
  { id: 285, name: 'Kamukunji', countyId: 47 },
  { id: 286, name: 'Starehe', countyId: 47 },
  { id: 287, name: 'Mathare', countyId: 47 }
]);



filteredWards = signal<any>([]);
  wards = signal<any>([
   // WARDS ARRAY (1450+ wards)

  // Mombasa - Changamwe
  { id: 1, name: "Port Reitz", constituencyId: 1 },
  { id: 2, name: "Kipevu", constituencyId: 1 },
  { id: 3, name: "Airport", constituencyId: 1 },
  { id: 4, name: "Miritini", constituencyId: 1 },
  { id: 5, name: "Chaani", constituencyId: 1 },
  
  // Mombasa - Jomvu
  { id: 6, name: "Jomvu Kuu", constituencyId: 2 },
  { id: 7, name: "Magongo", constituencyId: 2 },
  { id: 8, name: "Mikindani", constituencyId: 2 },
  
  // Mombasa - Kisauni
  { id: 9, name: "Mjambere", constituencyId: 3 },
  { id: 10, name: "Junda", constituencyId: 3 },
  { id: 11, name: "Bamburi", constituencyId: 3 },
  { id: 12, name: "Mwakirunge", constituencyId: 3 },
  { id: 13, name: "Mtopanga", constituencyId: 3 },
  { id: 14, name: "Magogoni", constituencyId: 3 },
  { id: 15, name: "Shanzu", constituencyId: 3 },
  
  // Mombasa - Likoni
  { id: 16, name: "Mtongwe", constituencyId: 4 },
  { id: 17, name: "Shika adabu", constituencyId: 4 },
  { id: 18, name: "Bofu", constituencyId: 4 },
  { id: 19, name: "Likoni", constituencyId: 4 },
  { id: 20, name: "Timbwani", constituencyId: 4 },
  
  // Mombasa - Mvita
  { id: 21, name: "Mji wa Kale/Makadara", constituencyId: 5 },
  { id: 22, name: "Tudor", constituencyId: 5 },
  { id: 23, name: "Tononoka", constituencyId: 5 },
  { id: 24, name: "Ganjoni/Shimanzi", constituencyId: 5 },
  { id: 25, name: "Majengo", constituencyId: 5 },
  
  // Mombasa - Nyali
  { id: 26, name: "Frere Town", constituencyId: 6 },
  { id: 27, name: "Ziwa la Ng'ombe", constituencyId: 6 },
  { id: 28, name: "Mkomani", constituencyId: 6 },
  { id: 29, name: "Kongowea", constituencyId: 6 },
  { id: 30, name: "Ziwani/Kadzandani", constituencyId: 6 },
  
  // Kwale - Kinango
  { id: 31, name: "Ndavaya", constituencyId: 7 },
  { id: 32, name: "Puma", constituencyId: 7 },
  { id: 33, name: "Kinango", constituencyId: 7 },
  { id: 34, name: "Chengoni/Samburu", constituencyId: 7 },
  { id: 35, name: "Mackinon Road", constituencyId: 7 },
  { id: 36, name: "Mwavumbo", constituencyId: 7 },
  { id: 37, name: "Kasemeni", constituencyId: 7 },
  
  // Kwale - Lunga Lunga
  { id: 38, name: "Pongwe/Kikoneni", constituencyId: 8 },
  { id: 39, name: "Dzombo", constituencyId: 8 },
  { id: 40, name: "Vanga", constituencyId: 8 },
  { id: 41, name: " Mwereni", constituencyId: 8 },
  
  // Kwale - Msambweni
  { id: 42, name: "Gombato Bongwe", constituencyId: 9 },
  { id: 43, name: " Ukunda", constituencyId: 9 },
  { id: 44, name: "Kinondo", constituencyId: 9 },
  { id: 45, name: "Ramisi", constituencyId: 9 },
  
  // Kwale - Matuga
  { id: 46, name: "  Tsimba Golini", constituencyId: 10 },
  { id: 47, name: "Waa", constituencyId: 10 },
  { id: 48, name: "Tiwi", constituencyId: 10 },
  { id: 49, name: "Kubo South", constituencyId: 10 },
  { id: 50, name: "Mkongani", constituencyId: 10 },
  
  // Kilifi - Kilifi North
  { id: 51, name: "Tezo", constituencyId: 11 },
  { id: 52, name: "Sokoni", constituencyId: 11 },
  { id: 53, name: "Kibarani", constituencyId: 11 },
  { id: 54, name: "Dabaso", constituencyId: 11 },
  { id: 55, name: "Matsangoni", constituencyId: 11 },
  { id: 56, name: "Watamu", constituencyId: 11 },
  { id: 57, name: "Mnarani", constituencyId: 11 },
  
  // Kilifi - Kilifi South
  { id: 58, name: "Junju", constituencyId: 12 },
  { id: 59, name: "Mwarakaya", constituencyId: 12 },
  { id: 60, name: "Shimo la Tewa", constituencyId: 12 },
  { id: 61, name: "Chasimba", constituencyId: 12 },
  { id: 62, name: "Mtepeni", constituencyId: 12 },
  
  // Kilifi - Kaloleni
  { id: 63, name: "Mariakani", constituencyId: 13 },
  { id: 64, name: "Kayafungo", constituencyId: 13 },
  { id: 65, name: "Kaloleni", constituencyId: 13 },
  { id: 66, name: "Mwanamwinga", constituencyId: 13 },
  
  // Kilifi - Ganze
  { id: 67, name: "Dungicha", constituencyId: 14 },
  { id: 68, name: "Bamba", constituencyId: 14 },
  { id: 69, name: "Jaribuni", constituencyId: 14 },
  { id: 70, name: "Sokoke", constituencyId: 14 },
  
  // Kilifi - Magarini
  { id: 71, name: "Maarafa", constituencyId: 15 },
  { id: 72, name: "Magarini", constituencyId: 15 },
  { id: 73, name: "Gongoni", constituencyId: 15 },
  { id: 74, name: "Adu", constituencyId: 15 },
  { id: 75, name: "Garashi", constituencyId: 15 },
  { id: 76, name: "Sabaki", constituencyId: 15 },
  
  // Kilifi - Rabai
  { id: 77, name: "Mwawesa", constituencyId: 16 },
  { id: 78, name: "Ruruma", constituencyId: 16 },
  { id: 79, name: "Jibana", constituencyId: 16 },
  { id: 80, name: "Rabai/Kisurutuni", constituencyId: 16 },
  
  // Kilifi - Malindi
  { id: 81, name: "Jilore", constituencyId: 17 },
  { id: 82, name: "Kakuyuni", constituencyId: 17 },
  { id: 83, name: "Ganda", constituencyId: 17 },
  { id: 84, name: "Malindi Town", constituencyId: 17 },
  { id: 85, name: "Shella", constituencyId: 17 },
  
  // Tana River - Garsen
  { id: 86, name: "Garsen Central", constituencyId: 18 },
  { id: 87, name: "Garsen East", constituencyId: 18 },
  { id: 88, name: "Garsen North", constituencyId: 18 },
  { id: 89, name: "Garsen South", constituencyId: 18 },
  { id: 90, name: "Kipini East", constituencyId: 18 },
  { id: 91, name: "Kipini West", constituencyId: 18 },
  
  // Tana River - Galole
  { id: 92, name: "Kinakomba", constituencyId: 19 },
  { id: 93, name: "Mikinduni", constituencyId: 19 },
  { id: 94, name: "Chewani", constituencyId: 19 },
  { id: 95, name: "Wayu", constituencyId: 19 },
  
  // Tana River - Bura
  { id: 96, name: "Chewele", constituencyId: 20 },
  { id: 97, name: "Hirimani", constituencyId: 20 },
  { id: 98, name: "Bangale", constituencyId: 20 },
  { id: 99, name: "Madogo", constituencyId: 20 },
  { id: 100, name: "Sala", constituencyId: 20 },
  
  // Lamu - Lamu East
  { id: 101, name: "Faza", constituencyId: 21 },
  { id: 102, name: "Kiunga", constituencyId: 21 },
  { id: 103, name: "Basuba", constituencyId: 21 },
  
  // Lamu - Lamu West
  { id: 104, name: "Shella", constituencyId: 22 },
  { id: 105, name: "Mkomani", constituencyId: 22 },
  { id: 106, name: "Hindi", constituencyId: 22 },
  { id: 107, name: "Mkunumbi", constituencyId: 22 },
  { id: 108, name: "Hongwe", constituencyId: 22 },
  { id: 109, name: "Witu", constituencyId: 22 },
  { id: 110, name: "Bahari", constituencyId: 22 },
  
  // Taita-Taveta - Taveta
  { id: 111, name: "Chala", constituencyId: 23 },
  { id: 112, name: "Mahoo", constituencyId: 23 },
  { id: 113, name: "Bomani", constituencyId: 23 },
  { id: 114, name: "Mboghoni", constituencyId: 23 },
  { id: 115, name: "Mata", constituencyId: 23 },
  
  // Taita-Taveta - Wundanyi
  { id: 116, name: "Wundanyi/Mbale", constituencyId: 24 },
  { id: 117, name: "Werugha", constituencyId: 24 },
  { id: 118, name: "Wumingu/Kishushe", constituencyId: 24 },
  { id: 119, name: "Mwanda/Mgange", constituencyId: 24 },
  
  // Taita-Taveta - Mwatate
  { id: 120, name: "Ronge", constituencyId: 25 },
  { id: 121, name: "Mwatate", constituencyId: 25 },
  { id: 122, name: "Bura", constituencyId: 25 },
  { id: 123, name: "Chawia", constituencyId: 25 },
  { id: 124, name: "Wusi/Kishamba", constituencyId: 25 },
  
  // Taita-Taveta - Voi
  { id: 125, name: "Mbololo", constituencyId: 26 },
  { id: 126, name: "Kaloleni", constituencyId: 26 },
  { id: 127, name: "Sagala", constituencyId: 26 },
  { id: 128, name: "Marungu", constituencyId: 26 },
  { id: 129, name: "Kaigau", constituencyId: 26 },
  { id: 130, name: "Ngolia", constituencyId: 26 },
  
  // Garissa - Dujis
  { id: 131, name: "Waberi", constituencyId: 27 },
  { id: 132, name: "Galbet", constituencyId: 27 },
  { id: 133, name: "Township", constituencyId: 27 },
  { id: 134, name: "Iftin", constituencyId: 27 },
  
  // Garissa - Balambala
  { id: 135, name: "Balambala", constituencyId: 28 },
  { id: 136, name: "Danyere", constituencyId: 28 },
  { id: 137, name: "Jarajara", constituencyId: 28 },
  { id: 138, name: "Saka", constituencyId: 28 },
  { id: 139, name: "Sankuri", constituencyId: 28 },
  
  // Garissa - Dadaab
  { id: 140, name: "Dertu", constituencyId: 29 },
  { id: 141, name: "Dadaab", constituencyId: 29 },
  { id: 142, name: "Labasigale", constituencyId: 29 },
  { id: 143, name: "Damajale", constituencyId: 29 },
  { id: 144, name: "Liboi", constituencyId: 29 },
  { id: 145, name: "Abakaile", constituencyId: 29 },
  
  // Garissa - Fafi
  { id: 146, name: "Bura", constituencyId: 30 },
  { id: 147, name: "Dekaharia", constituencyId: 30 },
  { id: 148, name: "Jarajila", constituencyId: 30 },
  { id: 149, name: "Fafi", constituencyId: 30 },
  { id: 150, name: "Nanighi", constituencyId: 30 },
  
  // Garissa - Ijara
  { id: 151, name: "Hulugho", constituencyId: 31 },
  { id: 152, name: "Sangailu", constituencyId: 31 },
  { id: 153, name: "Ijara", constituencyId: 31 },
  { id: 154, name: "Masalani", constituencyId: 31 },
  
  // Garissa - Lagdera
  { id: 155, name: "Modogashe", constituencyId: 32 },
  { id: 156, name: "Bename", constituencyId: 32 },
  { id: 157, name: "Goreale", constituencyId: 32 },
  { id: 158, name: "Maalamin", constituencyId: 32 },
  { id: 159, name: "Sabena", constituencyId: 32 },
  { id: 160, name: "Baraki", constituencyId: 32 },
  
  // Wajir - Wajir East
  { id: 161, name: "Wagbri", constituencyId: 33 },
  { id: 162, name: "Township", constituencyId: 33 },
  { id: 163, name: "Barwago", constituencyId: 33 },
  { id: 164, name: "Khorof/Harar", constituencyId: 33 },
  
  // Wajir - Wajir North
  { id: 165, name: "Gurar", constituencyId: 34 },
  { id: 166, name: "Bute", constituencyId: 34 },
  { id: 167, name: "Korondile", constituencyId: 34 },
  { id: 168, name: "Malkagufu", constituencyId: 34 },
  { id: 169, name: "Batalu", constituencyId: 34 },
  { id: 170, name: "Danaba", constituencyId: 34 },
  { id: 171, name: "Godoma", constituencyId: 34 },
  
  // Wajir - Wajir South
  { id: 172, name: "Benane", constituencyId: 35 },
  { id: 173, name: "Burder", constituencyId: 35 },
  { id: 174, name: "Dadaja Bulla", constituencyId: 35 },
  { id: 175, name: "Habaswein", constituencyId: 35 },
  { id: 176, name: "Lagboghol South", constituencyId: 35 },
  { id: 177, name: "Ibrahim Ure", constituencyId: 35 },
  
  // Wajir - Wajir West
  { id: 178, name: "Arbajahan", constituencyId: 36 },
  { id: 179, name: "Hadado/Athibohol", constituencyId: 36 },
  { id: 180, name: "Ademasajide", constituencyId: 36 },
  { id: 181, name: "Ganyure", constituencyId: 36 },
  { id: 182, name: "Wagalla", constituencyId: 36 },
  
  // Wajir - Tarbaj
  { id: 183, name: "Elben", constituencyId: 37 },
  { id: 184, name: "Sarman", constituencyId: 37 },
  { id: 185, name: "Tarbaj", constituencyId: 37 },
  { id: 186, name: "Wargadud", constituencyId: 37 },
  
  // Wajir - Eldas
  { id: 187, name: "Eldas", constituencyId: 38 },
  { id: 188, name: "Della", constituencyId: 38 },
  { id: 189, name: "Lakoley South/Basir", constituencyId: 38 },
  { id: 190, name: "Elnur/Tula Tula", constituencyId: 38 },
  
  // Mandera - Mandera West
  { id: 191, name: "Takaba South", constituencyId: 39 },
  { id: 192, name: "Takaba", constituencyId: 39 },
  { id: 193, name: "Lagsure", constituencyId: 39 },
  { id: 194, name: "Dandu", constituencyId: 39 },
  { id: 195, name: "Gither", constituencyId: 39 },
  
  // Mandera - Banissa
  { id: 196, name: "Banissa", constituencyId: 40 },
  { id: 197, name: "Derkhale", constituencyId: 40 },
  { id: 198, name: "Guba", constituencyId: 40 },
  { id: 199, name: "Malkamari", constituencyId: 40 },
  { id: 200, name: "Kiliwehiri", constituencyId: 40 },
  
  // Mandera - Mandera North
  { id: 201, name: "Ashabito", constituencyId: 41 },
  { id: 202, name: "Guticha", constituencyId: 41 },
  { id: 203, name: "Marothile", constituencyId: 41 },
  { id: 204, name: "Rhamu", constituencyId: 41 },
  { id: 205, name: "Rhamu Dimtu", constituencyId: 41 },
  
  // Mandera - Mandera South
  { id: 206, name: "Wargadud", constituencyId: 42 },
  { id: 207, name: "Kutulo", constituencyId: 42 },
  { id: 208, name: "Elwak South", constituencyId: 42 },
  { id: 209, name: "Elwak North", constituencyId: 42 },
  { id: 210, name: "Shimbir Fatuma", constituencyId: 42 },
  
  // Mandera - Mandera East
  { id: 211, name: "Arabia", constituencyId: 43 },
  { id: 212, name: "Libehia", constituencyId: 43 },
  { id: 213, name: "Khalalio", constituencyId: 43 },
  { id: 214, name: "Neboi", constituencyId: 43 },
  { id: 215, name: "Township", constituencyId: 43 },
  
  // Mandera - Lafey
  { id: 216, name: "Sala", constituencyId: 44 },
  { id: 217, name: "Fino", constituencyId: 44 },
  { id: 218, name: "Lafey", constituencyId: 44 },
  { id: 219, name: "Warangara", constituencyId: 44 },
  { id: 220, name: "Alungo", constituencyId: 44 },
  
  // Marsabit - Laisamis
  { id: 221, name: "  Loiyangalani", constituencyId: 45 },
  { id: 222, name: "Kargi/South Horr", constituencyId: 45 },
  { id: 223, name: "Korr/Ngurunit", constituencyId: 45 },
  { id: 224, name: "LogoLogo", constituencyId: 45 },
  { id: 225, name: "Laisamis", constituencyId: 45 },
  
  // Marsabit - North Horr
  { id: 226, name: "  Dukana", constituencyId: 46 },
  { id: 227, name: "Maikona", constituencyId: 46 },
  { id: 228, name: "Turbi", constituencyId: 46 },
  { id: 229, name: "North Horr", constituencyId: 46 },
  { id: 230, name: " Illeret", constituencyId: 46 },
  
  // Marsabit - Saku
  { id: 231, name: "Sagate/Jaldesa", constituencyId: 47 },
  { id: 232, name: "Karare", constituencyId: 47 },
  { id: 233, name: "Marsabit Central", constituencyId: 47 },
  
  // Marsabit - Moyale
  { id: 234, name: "Butiye", constituencyId: 48 },
  { id: 235, name: "Sololo", constituencyId: 48 },
  { id: 236, name: "Heillu/Manyatta", constituencyId: 48 },
  { id: 237, name: "Golbo", constituencyId: 48 },
  { id: 238, name: "Moyale Township", constituencyId: 48 },
  { id: 239, name: "Uran", constituencyId: 48 },
  { id: 240, name: "Obbu", constituencyId: 48 },
  
  // Isiolo - Isiolo North
  { id: 241, name: "Wabera", constituencyId: 49 },
  { id: 242, name: "Bulla Pesa", constituencyId: 49 },
  { id: 243, name: "Chari", constituencyId: 49 },
  { id: 244, name: "Cherab", constituencyId: 49 },
  { id: 245, name: "Ngare Mara", constituencyId: 49 },
  { id: 246, name: "Burat", constituencyId: 49 },
  { id: 247, name: "Oldo/Nyiro", constituencyId: 49 },
  
  // Isiolo - Isiolo South
  { id: 248, name: "Garba Tulla", constituencyId: 50 },
  { id: 249, name: "Kina", constituencyId: 50 },
  { id: 250, name: "Sericho", constituencyId: 50 },
  
  // Meru - Buuri
  { id: 251, name: "Timau", constituencyId: 51 },
  { id: 252, name: "Kisima", constituencyId: 51 },
  { id: 253, name: "Kiirua/Naari", constituencyId: 51 },
  { id: 254, name: "Ruiri/Rwarera", constituencyId: 51 },
  
  // Meru - Central Imenti
  { id: 255, name: "Mwanganthia", constituencyId: 52 },
  { id: 256, name: "Abothuguchi Central", constituencyId: 52 },
  { id: 257, name: "Abothuguchi West", constituencyId: 52 },
  { id: 258, name: "Kiagu", constituencyId: 52 },
  { id: 259, name: "Kibirichia", constituencyId: 52 },
  
  // Meru - Igembe Central
  { id: 260, name: "Akirang'ondu", constituencyId: 53 },
  { id: 261, name: "Athiru", constituencyId: 53 },
  { id: 262, name: "Ruujine", constituencyId: 53 },
  { id: 263, name: "Igembe East Njia", constituencyId: 53 },
  { id: 264, name: "Kangeta", constituencyId: 53 },
  
  // Meru - Igembe South
  { id: 265, name: "Maua", constituencyId: 54 },
  { id: 266, name: "Kegoi/Antubochiu", constituencyId: 54 },
  { id: 267, name: "Athiru", constituencyId: 54 },
  { id: 268, name: "Gaiti", constituencyId: 54 },
  { id: 269, name: "Akachiu", constituencyId: 54 },
  { id: 270, name: "Kanuni", constituencyId: 54 },
  
  // Meru - Igembe North
  { id: 271, name: "Antuambui", constituencyId: 55 },
  { id: 272, name: "Ntunene", constituencyId: 55 },
  { id: 273, name: "Antubetwe Kiongo", constituencyId: 55 },
  { id: 274, name: "Naathui", constituencyId: 55 },
  { id: 275, name: "Amwathi", constituencyId: 55 },
  
  // Meru - Tigania West
  { id: 276, name: "Athwana", constituencyId: 56 },
  { id: 277, name: "Akithi", constituencyId: 56 },
  { id: 278, name: "Kianjai", constituencyId: 56 },
  { id: 279, name: "Nkomo", constituencyId: 56 },
  { id: 280, name: "Mbeu", constituencyId: 56 },
  
  // Meru - Tigania East
  { id: 281, name: "Thangatha", constituencyId: 57 },
  { id: 282, name: "Mikinduri", constituencyId: 57 },
  { id: 283, name: "Kiguchwa", constituencyId: 57 },
  { id: 284, name: "Mithara", constituencyId: 57 },
  { id: 285, name: "Karama", constituencyId: 57 },
  
  // Meru - Imenti North
  { id: 286, name: "Municipality", constituencyId: 58 },
  { id: 287, name: "Ntima East", constituencyId: 58 },
  { id: 288, name: "Ntima West", constituencyId: 58 },
  { id: 289, name: "Nyaki West", constituencyId: 58 },
  { id: 290, name: "Nyaki East", constituencyId: 58 },
  
  // Meru - Imenti South
  { id: 291, name: "Mitunguu", constituencyId: 59 },
  { id: 292, name: "Igoji East", constituencyId: 59 },
  { id: 293, name: "Igoji West", constituencyId: 59 },
  { id: 294, name: "Abogeta East", constituencyId: 59 },
  { id: 295, name: "Abogeta West", constituencyId: 59 },
  { id: 296, name: "Nkuene", constituencyId: 59 },
  
  // Tharaka Nithi - Tharaka
  { id: 297, name: "Gatunga", constituencyId: 60 },
  { id: 298, name: "Mukothima", constituencyId: 60 },
  { id: 299, name: "Nkondi", constituencyId: 60 },
  { id: 300, name: "Chiakariga", constituencyId: 60 },
  { id: 301, name: "Marimanti", constituencyId: 60 },
  
  // Tharaka Nithi - Chuka/Igambang'ombe
  { id: 302, name: "Mariani", constituencyId: 61 },
  { id: 303, name: "Karingani", constituencyId: 61 },
  { id: 304, name: "Magumoni", constituencyId: 61 },
  { id: 305, name: "Mugwe", constituencyId: 61 },
  { id: 306, name: "Igambang'ombe", constituencyId: 61 },
  
  // Tharaka Nithi - Maara
  { id: 307, name: "Mitheru", constituencyId: 62 },
  { id: 308, name: "Muthambi", constituencyId: 62 },
  { id: 309, name: "Mwimbi", constituencyId: 62 },
  { id: 310, name: "Ganga", constituencyId: 62 },
  { id: 311, name: "Chogoria", constituencyId: 62 },
  
  // Embu - Manyatta
  { id: 312, name: "Ruguru/Ngandori", constituencyId: 63 },
  { id: 313, name: "Kithimu", constituencyId: 63 },
  { id: 314, name: "Nginda", constituencyId: 63 },
  { id: 315, name: "Mbeti North", constituencyId: 63 },
  { id: 316, name: "Kirimari", constituencyId: 63 },
  { id: 317, name: "Gaturi South", constituencyId: 63 },
  
  // Embu - Runyenjes
  { id: 318, name: "Gaturi North", constituencyId: 64 },
  { id: 319, name: "Kagaari South", constituencyId: 64 },
  { id: 320, name: "Kagaari North", constituencyId: 64 },
  { id: 321, name: "Central Ward", constituencyId: 64 },
  { id: 322, name: "Kyeni North", constituencyId: 64 },
  { id: 323, name: "Kyeni South", constituencyId: 64 },
  
  // Embu - Mbeere North
  { id: 324, name: "Nthawa", constituencyId: 65 },
  { id: 325, name: "Muminji", constituencyId: 65 },
  { id: 326, name: "Evurore", constituencyId: 65 },
  
  // Embu - Mbeere South
  { id: 327, name: "Mwea", constituencyId: 66 },
  { id: 328, name: "Amakim", constituencyId: 66 },
  { id: 329, name: "Mbeti South", constituencyId: 66 },
  { id: 330, name: "Mavuria", constituencyId: 66 },
  { id: 331, name: "Kiambere", constituencyId: 66 },
  
  // Kitui - Kitui West
  { id: 332, name: "Mutonguni", constituencyId: 67 },
  { id: 333, name: "Kauwi", constituencyId: 67 },
  { id: 334, name: "Matinyani", constituencyId: 67 },
  { id: 335, name: "Kwa Mutonga/Kithum Ula", constituencyId: 67 },
  
  // Kitui - Kitui Central
  { id: 336, name: "Miambani", constituencyId: 68 },
  { id: 337, name: "Township Kyangwithya West", constituencyId: 68 },
  { id: 338, name: "Mulango", constituencyId: 68 },
  { id: 339, name: "Kyangwithya East", constituencyId: 68 },
  
  // Kitui - Kitui Rural
  { id: 340, name: "Kisasi", constituencyId: 69 },
  { id: 341, name: "Mbitini", constituencyId: 69 },
  { id: 342, name: "Kwavonza/Yatta", constituencyId: 69 },
  { id: 343, name: "Kanyangi", constituencyId: 69 },
  
  // Kitui - Kitui South
  { id: 344, name: "Ikana/Kyantune", constituencyId: 70 },
  { id: 345, name: "Mutomo", constituencyId: 70 },
  { id: 346, name: "Mutha", constituencyId: 70 },
  { id: 347, name: "Ikutha", constituencyId: 70 },
  { id: 348, name: "Kanziko", constituencyId: 70 },
  { id: 349, name: "Athi", constituencyId: 70 },
  
  // Kitui - Kitui East
  { id: 350, name: "Zombe/Mwitika", constituencyId: 71 },
  { id: 351, name: "Nzambani", constituencyId: 71 },
  { id: 352, name: "Chuluni", constituencyId: 71 },
  { id: 353, name: "Voo/Kyamatu", constituencyId: 71 },
  { id: 354, name: "Endau/Malalani", constituencyId: 71 },
  { id: 355, name: "Mutito/Kaliku", constituencyId: 71 },
  
  // Kitui - Mwingi North
  { id: 356, name: "Ngomeni", constituencyId: 72 },
  { id: 357, name: "Kyuso", constituencyId: 72 },
  { id: 358, name: "Mumoni", constituencyId: 72 },
  { id: 359, name: "Tseikuru", constituencyId: 72 },
  { id: 360, name: "Tharaka", constituencyId: 72 },
  
  // Kitui - Mwingi West
  { id: 361, name: "Kyome/Thaana", constituencyId: 73 },
  { id: 362, name: "Nguutani", constituencyId: 73 },
  { id: 363, name: "Migwani", constituencyId: 73 },
  { id: 364, name: "Kiomo/Kyethani", constituencyId: 73 },
  
  // Kitui - Mwingi Central
  { id: 365, name: "Central", constituencyId: 74 },
  { id: 366, name: "Kivou", constituencyId: 74 },
  { id: 367, name: "Nguni", constituencyId: 74 },
  { id: 368, name: "Mui", constituencyId: 74 },
  { id: 369, name: "Waita", constituencyId: 74 },
  
  // Machakos - Masinga
  { id: 370, name: "Kivaa", constituencyId: 75 },
  { id: 371, name: "Masinga", constituencyId: 75 },
  { id: 372, name: "Central", constituencyId: 75 },
  { id: 373, name: "Ekalakala", constituencyId: 75 },
  { id: 374, name: "Muthesya", constituencyId: 75 },
  { id: 375, name: "Ndithini", constituencyId: 75 },
  
  // Machakos - Yatta
  { id: 376, name: "Ndalani", constituencyId: 76 },
  { id: 377, name: "Matuu", constituencyId: 76 },
  { id: 378, name: "Kithimani", constituencyId: 76 },
  { id: 379, name: "Ikomba", constituencyId: 76 },
  { id: 380, name: "Katangi", constituencyId: 76 },
  
  // Machakos - Matungulu
  { id: 381, name: "Tala", constituencyId: 77 },
  { id: 382, name: "Matungulu North", constituencyId: 77 },
  { id: 383, name: "Matungulu East", constituencyId: 77 },
  { id: 384, name: "Matungulu West", constituencyId: 77 },
  { id: 385, name: "Kyeleni", constituencyId: 77 },
  
  // Machakos - Kangundo
  { id: 386, name: "Kangundo North", constituencyId: 78 },
  { id: 387, name: "Kangundo Central", constituencyId: 78 },
  { id: 388, name: "Kangundo East", constituencyId: 78 },
  { id: 389, name: "Kangundo West", constituencyId: 78 },
  
  // Machakos - Mwala
  { id: 390, name: "Mbiuni", constituencyId: 79 },
  { id: 391, name: "Makutano/Mwala", constituencyId: 79 },
  { id: 392, name: "Masii", constituencyId: 79 },
  { id: 393, name: "Muthetheni", constituencyId: 79 },
  { id: 394, name: "Wamunyu", constituencyId: 79 },
  { id: 395, name: "Kibauni", constituencyId: 79 },
  
  // Machakos - Kathiani
  { id: 396, name: "Mitaboni", constituencyId: 80 },
  { id: 397, name: "Kathiani Central", constituencyId: 80 },
  { id: 398, name: "Upper Kaewa/Iveti", constituencyId: 80 },
  { id: 399, name: "Lower Kaewa/Kaani", constituencyId: 80 },
  
  // Machakos - Machakos Town
  { id: 400, name: "Kalama", constituencyId: 81 },
  { id: 401, name: "Mua", constituencyId: 81 },
  { id: 402, name: "Mutitini", constituencyId: 81 },
  { id: 403, name: "Machakos Central", constituencyId: 81 },
  { id: 404, name: "Mumbuni North", constituencyId: 81 },
  { id: 405, name: "Muvuti/Kiima-Kimwe", constituencyId: 81 },
  { id: 406, name: "Kola", constituencyId: 81 },
  
  // Machakos - Mavoko
  { id: 407, name: "Athi River", constituencyId: 82 },
  { id: 408, name: "Kinanie", constituencyId: 82 },
  { id: 409, name: "Muthwani", constituencyId: 82 },
  { id: 410, name: "Syokimau/Mulolongo", constituencyId: 82 },
  
  // Makueni - Mbooni
  { id: 411, name: "Tulimani", constituencyId: 83 },
  { id: 412, name: "Mbooni", constituencyId: 83 },
  { id: 413, name: "Kithungo/Kitundu", constituencyId: 83 },
  { id: 414, name: "Kiteta/Kisau", constituencyId: 83 },
  { id: 415, name: "Waia-Kako", constituencyId: 83 },
  { id: 416, name: "Kalawa", constituencyId: 83 },
  
  // Makueni - Kaiti
  { id: 417, name: "Ukia", constituencyId: 84 },
  { id: 418, name: "Kee", constituencyId: 84 },
  { id: 419, name: "Kilungu", constituencyId: 84 },
  { id: 420, name: "Ilima", constituencyId: 84 },
  
  // Makueni - Makueni
  { id: 421, name: "Wote", constituencyId: 85 },
  { id: 422, name: "Muvau/Kikuumini", constituencyId: 85 },
  { id: 423, name: "Mavindini", constituencyId: 85 },
  { id: 424, name: "Kitise/Kithuki", constituencyId: 85 },
  { id: 425, name: "Kathonzweni", constituencyId: 85 },
  { id: 426, name: "Nzau/Kilili/Kalamba", constituencyId: 85 },
  { id: 427, name: "Mbitini", constituencyId: 85 },
  
  // Makueni - Kilome
  { id: 428, name: "Kasikeu", constituencyId: 86 },
  { id: 429, name: "Mukaa", constituencyId: 86 },
  { id: 430, name: "Kiima Kiu/Kalanzoni", constituencyId: 86 },
  
  // Makueni - Kibwezi East
  { id: 431, name: "Masongaleni", constituencyId: 87 },
  { id: 432, name: "Mtito Andei", constituencyId: 87 },
  { id: 433, name: "Thange", constituencyId: 87 },
  { id: 434, name: "Ivingoni/Nzambani", constituencyId: 87 },
  
  // Makueni - Kibwezi West
  { id: 435, name: "Makindu", constituencyId: 88 },
  { id: 436, name: "Nguumo", constituencyId: 88 },
  { id: 437, name: "Kikumbulyu North", constituencyId: 88 },
  { id: 438, name: "Kimumbulyu South", constituencyId: 88 },
  { id: 439, name: "Nguu/Masumba", constituencyId: 88 },
  { id: 440, name: "Emali/Mulala", constituencyId: 88 },
  
  // Nyandarua - Kinangop
  { id: 441, name: "Engineer", constituencyId: 89 },
  { id: 442, name: "Gathara", constituencyId: 89 },
  { id: 443, name: "North Kinangop", constituencyId: 89 },
  { id: 444, name: "Murungaru", constituencyId: 89 },
  { id: 445, name: "Njabini/Kiburu", constituencyId: 89 },
  { id: 446, name: "Nyakio", constituencyId: 89 },
  { id: 447, name: "Githabai", constituencyId: 89 },
  { id: 448, name: "Magumu", constituencyId: 89 },
  
  // Nyandarua - Kipipiri
  { id: 449, name: "Wanjohi", constituencyId: 90 },
  { id: 450, name: "Kipipiri", constituencyId: 90 },
  { id: 451, name: "Geta", constituencyId: 90 },
  { id: 452, name: "Githioro", constituencyId: 90 },
  
  // Nyandarua - Ol Joro Orok
  { id: 453, name: "Gathanji", constituencyId: 91 },
  { id: 454, name: "Gatima", constituencyId: 91 },
  { id: 455, name: "Weru", constituencyId: 91 },
  { id: 456, name: "Charagita", constituencyId: 91 },
  
  // Nyandarua - Ndaragwa
  { id: 457, name: "Leshau/Pondo", constituencyId: 92 },
  { id: 458, name: "Kiriita", constituencyId: 92 },
  { id: 459, name: "Central", constituencyId: 92 },
  { id: 460, name: "Shamata", constituencyId: 92 },
  
  // Nyandarua - Ol Kalou
  { id: 461, name: "Karau", constituencyId: 93 },
  { id: 462, name: "Kanjuiri Range", constituencyId: 93 },
  { id: 463, name: "Mirangine", constituencyId: 93 },
  { id: 464, name: "Kaimbaga", constituencyId: 93 },
  { id: 465, name: "Rurii", constituencyId: 93 },
  
  // Nyeri - Mathira
  { id: 466, name: "Ruguru", constituencyId: 94 },
  { id: 467, name: "Magutu", constituencyId: 94 },
  { id: 468, name: "Iriani", constituencyId: 94 },
  { id: 469, name: "Konyu", constituencyId: 94 },
  { id: 470, name: "Kirimukuyu", constituencyId: 94 },
  { id: 471, name: "Karatina Town", constituencyId: 94 },
  
  // Nyeri - Othaya
  { id: 472, name: "Mahiga", constituencyId: 95 },
  { id: 473, name: "Iria-Ini", constituencyId: 95 },
  { id: 474, name: "Chinga", constituencyId: 95 },
  { id: 475, name: "Karima", constituencyId: 95 },
  
  // Nyeri - Tetu
  { id: 476, name: "Dedan Kimathi", constituencyId: 96 },
  { id: 477, name: "Wamagana", constituencyId: 96 },
  { id: 478, name: "Aguthi-Gaaki", constituencyId: 96 },
  
  // Nyeri - Mukurweini
  { id: 479, name: "Gikondi", constituencyId: 97 },
  { id: 480, name: "Rugi", constituencyId: 97 },
  { id: 481, name: "Mukurwe-Ini West", constituencyId: 97 },
  { id: 482, name: "Mukurwe-Ini Central", constituencyId: 97 },
  
  // Nyeri - Nyeri Town
  { id: 483, name: "Kiganjo/Mathari", constituencyId: 98 },
  { id: 484, name: "Rware", constituencyId: 98 },
  { id: 485, name: "Gatitu/Muruguru", constituencyId: 98 },
  { id: 486, name: "Ruring'u", constituencyId: 98 },
  { id: 487, name: "Kamakwa/Mukaro", constituencyId: 98 },
  
  // Nyeri - Kieni
  { id: 488, name: "Mweiga", constituencyId: 99 },
  { id: 489, name: "Naromoro Kiamthaga", constituencyId: 99 },
  { id: 490, name: "Mwiyogo/Endara Sha", constituencyId: 99 },
  { id: 491, name: "Mugunda", constituencyId: 99 },
  { id: 492, name: "Gatarakwa", constituencyId: 99 },
  { id: 493, name: "Thegu River", constituencyId: 99 },
  { id: 494, name: "Kabaru", constituencyId: 99 },
  { id: 495, name: "Gakawa", constituencyId: 99 },
  
  // Kirinyaga - Kirinyaga Central
  { id: 496, name: "Mutira", constituencyId: 100 },
  { id: 497, name: "Kanyekini", constituencyId: 100 },
  { id: 498, name: "Kerugoya", constituencyId: 100 },
  { id: 499, name: "Inoi", constituencyId: 100 },
  
  // Kirinyaga - Mwea
  { id: 500, name: "Mutithi", constituencyId: 101 },
  { id: 501, name: "Kangai", constituencyId: 101 },
  { id: 502, name: "Wamumu", constituencyId: 101 },
  { id: 503, name: "Nyangati", constituencyId: 101 },
  { id: 504, name: "Murindiko", constituencyId: 101 },
  { id: 505, name: "Gathigiriri", constituencyId: 101 },
  { id: 506, name: "Teberer", constituencyId: 101 },
  { id: 507, name: "Thiba", constituencyId: 101 },
  
  // Kirinyaga - Gichugu
  { id: 508, name: "Kabare Baragwi", constituencyId: 102 },
  { id: 509, name: "Njukiini", constituencyId: 102 },
  { id: 510, name: "Ngariama", constituencyId: 102 },
  { id: 511, name: "Karumandi", constituencyId: 102 },
  
  // Kirinyaga - Ndia
  { id: 512, name: "Mukure", constituencyId: 103 },
  { id: 513, name: "Kiine", constituencyId: 103 },
  { id: 514, name: "Kariti", constituencyId: 103 },
  
  // Murang'a - Gatanga
  { id: 515, name: "Ithanga", constituencyId: 104 },
  { id: 516, name: "Kakuzi/Mitubiri", constituencyId: 104 },
  { id: 517, name: "Mugumo-Ini", constituencyId: 104 },
  { id: 518, name: "Kihumbu-Ini", constituencyId: 104 },
  { id: 519, name: "Gatanga", constituencyId: 104 },
  { id: 520, name: "Kariara", constituencyId: 104 },
  
  // Murang'a - Kandara
  { id: 521, name: "Ng'ararii", constituencyId: 105 },
  { id: 522, name: "Muruka", constituencyId: 105 },
  { id: 523, name: "Kangundu-Ini", constituencyId: 105 },
  { id: 524, name: "Gaichanjiru", constituencyId: 105 },
  { id: 525, name: "Ithiru", constituencyId: 105 },
  { id: 526, name: "Ruchu", constituencyId: 105 },
  
  // Murang'a - Kigumo
  { id: 527, name: "Kahumbu", constituencyId: 106 },
  { id: 528, name: "Muthithi", constituencyId: 106 },
  { id: 529, name: "Kigumo", constituencyId: 106 },
  { id: 530, name: "Kangari", constituencyId: 106 },
  { id: 531, name: "Kinyona", constituencyId: 106 },
  
  // Murang'a - Mathioya
  { id: 532, name: "Gituhi", constituencyId: 107 },
  { id: 533, name: "Kiru", constituencyId: 107 },
  { id: 534, name: "Kamacharia", constituencyId: 107 },
  
  // Murang'a - Kiharu
  { id: 535, name: "Wangu", constituencyId: 108 },
  { id: 536, name: "Mugoiri", constituencyId: 108 },
  { id: 537, name: "Mbiri", constituencyId: 108 },
  { id: 538, name: "Township", constituencyId: 108 },
  { id: 539, name: "Murarandia", constituencyId: 108 },
  { id: 540, name: "Gaturi", constituencyId: 108 },
  
  // Murang'a - Kangema
  { id: 541, name: "Kanyenya-Ini", constituencyId: 109 },
  { id: 542, name: "Muguru", constituencyId: 109 },
  { id: 543, name: "Rwathia", constituencyId: 109 },
  
  // Murang'a - Maragwa
  { id: 544, name: "Kimorori/Wempa", constituencyId: 110 },
  { id: 545, name: "Makuyu", constituencyId: 110 },
  { id: 546, name: "Kambiti", constituencyId: 110 },
  { id: 547, name: "Kamahuha", constituencyId: 110 },
  { id: 548, name: "Ichagaki", constituencyId: 110 },
  { id: 549, name: "Nginda", constituencyId: 110 },
  
  // Kiambu - Gatundu North
  { id: 550, name: "Gituamba", constituencyId: 111 },
  { id: 551, name: "Githobokoni", constituencyId: 111 },
  { id: 552, name: "Chania", constituencyId: 111 },
  { id: 553, name: "Mang'u", constituencyId: 111 },
  
  // Kiambu - Gatundu South
  { id: 554, name: "Kiamwangi", constituencyId: 112 },
  { id: 555, name: "Kiganjo", constituencyId: 112 },
  { id: 556, name: "Ndarugu", constituencyId: 112 },
  { id: 557, name: "Ngenda", constituencyId: 112 },
  
  // Kiambu - Githunguri
  { id: 558, name: "Githunguri", constituencyId: 113 },
  { id: 559, name: "Githiga", constituencyId: 113 },
  { id: 560, name: "Ikinu", constituencyId: 113 },
  { id: 561, name: "Ngewa", constituencyId: 113 },
  { id: 562, name: "Komothai", constituencyId: 113 },
  
  // Kiambu - Juja
  { id: 563, name: "Murera", constituencyId: 114 },
  { id: 564, name: "Theta", constituencyId: 114 },
  { id: 565, name: "Juja", constituencyId: 114 },
  { id: 566, name: "Witeithie", constituencyId: 114 },
  { id: 567, name: "Kalimoni", constituencyId: 114 },
  
  // Kiambu - Kabete
  { id: 568, name: "Gitaru", constituencyId: 115 },
  { id: 569, name: "Muguga", constituencyId: 115 },
  { id: 570, name: "Nyathuna", constituencyId: 115 },
  { id: 571, name: "Kabete", constituencyId: 115 },
  { id: 572, name: "Uthiru", constituencyId: 115 },
  
  // Kiambu - Kiambaa
  { id: 573, name: "Cianda", constituencyId: 116 },
  { id: 574, name: "Karuiri", constituencyId: 116 },
  { id: 575, name: "Ndenderu", constituencyId: 116 },
  { id: 576, name: "Muchatha", constituencyId: 116 },
  { id: 577, name: "Kihara", constituencyId: 116 },
  
  // Kiambu - Kiambu
  { id: 578, name: "Ting'ang'a", constituencyId: 117 },
  { id: 579, name: "Ndumberi", constituencyId: 117 },
  { id: 580, name: "Riabai", constituencyId: 117 },
  { id: 581, name: "Township", constituencyId: 117 },
  
  // Kiambu - Limuru
  { id: 582, name: "Bibirioni", constituencyId: 118 },
  { id: 583, name: "Limuru Central", constituencyId: 118 },
  { id: 584, name: "Ndeiya", constituencyId: 118 },
  { id: 585, name: "Limuru East", constituencyId: 118 },
  { id: 586, name: "Ngecha Tigoni", constituencyId: 118 },
  
  // Kiambu - Kikuyu
  { id: 587, name: "Karai", constituencyId: 119 },
  { id: 588, name: "Nachu", constituencyId: 119 },
  { id: 589, name: "Sigona", constituencyId: 119 },
  { id: 590, name: "Kikuyu", constituencyId: 119 },
  { id: 591, name: "Kinoo", constituencyId: 119 },
  
  // Kiambu - Lari
  { id: 592, name: "Kijabe", constituencyId: 120 },
  { id: 593, name: "Nyanduma", constituencyId: 120 },
  { id: 594, name: "Kamburu", constituencyId: 120 },
  { id: 595, name: "Lari/Kirenga", constituencyId: 120 },
  
  // Kiambu - Ruiru
  { id: 596, name: "Gitothua", constituencyId: 121 },
  { id: 597, name: "Biashara", constituencyId: 121 },
  { id: 598, name: "Gatongora", constituencyId: 121 },
  { id: 599, name: "Kahawa Sukari", constituencyId: 121 },
  { id: 600, name: "Kahawa Wendani", constituencyId: 121 },
  { id: 601, name: "Kiuu", constituencyId: 121 },
  { id: 602, name: "Mwiki", constituencyId: 121 },
  { id: 603, name: "Mwihoko", constituencyId: 121 },
  
  // Kiambu - Thika Town
  { id: 604, name: "Township", constituencyId: 122 },
  { id: 605, name: "Kamenu", constituencyId: 122 },
  { id: 606, name: "Hospital", constituencyId: 122 },
  { id: 607, name: "Gatuanyaga", constituencyId: 122 },
  { id: 608, name: "Ngoliba", constituencyId: 122 },
  
  // Turkana - Turkana Central
  { id: 609, name: "Kerio Delta", constituencyId: 123 },
  { id: 610, name: "Kang'atotha", constituencyId: 123 },
  { id: 611, name: "Kalokol", constituencyId: 123 },
  { id: 612, name: "Lodwar Township", constituencyId: 123 },
  { id: 613, name: "Kanamkemer", constituencyId: 123 },
  
  // Turkana - Turkana East
  { id: 614, name: "Kapedo/Napeito", constituencyId: 124 },
  { id: 615, name: "Katilia", constituencyId: 124 },
  { id: 616, name: "Lokori/Kochodin", constituencyId: 124 },
  
  // Turkana - Turkana North
  { id: 617, name: "Kaeris", constituencyId: 125 },
  { id: 618, name: "Lake zone", constituencyId: 125 },
  { id: 619, name: "Lapur", constituencyId: 125 },
  { id: 620, name: "Kaaleng/kaikor", constituencyId: 125 },
  { id: 621, name: "Kibish", constituencyId: 125 },
  { id: 622, name: "Nakalale", constituencyId: 125 },
  
  // Turkana - Turkana South
  { id: 623, name: "Kaputir", constituencyId: 126 },
  { id: 624, name: "Katilu", constituencyId: 126 },
  { id: 625, name: "Lobokat", constituencyId: 126 },
  { id: 626, name: "Kalapata", constituencyId: 126 },
  { id: 627, name: "Lokichar", constituencyId: 126 },
  
  // Turkana - Turkana West
  { id: 628, name: "Kakuma", constituencyId: 127 },
  { id: 629, name: "Lopur", constituencyId: 127 },
  { id: 630, name: "Letea", constituencyId: 127 },
  { id: 631, name: "Songot", constituencyId: 127 },
  { id: 632, name: "Kalobeyei", constituencyId: 127 },
  { id: 633, name: "Lokichoggio", constituencyId: 127 },
  { id: 634, name: "Nanaam", constituencyId: 127 },
  
  // Turkana - Loima
  { id: 635, name: "Kotaruk/Lobei", constituencyId: 128 },
  { id: 636, name: "Turkwel", constituencyId: 128 },
  { id: 637, name: "Loima", constituencyId: 128 },
  { id: 638, name: "Lokiriama/Loren Gippi", constituencyId: 128 },
  
  // West Pokot - Kapenguria
  { id: 639, name: "Riwo", constituencyId: 129 },
  { id: 640, name: "Kapenguria", constituencyId: 129 },
  { id: 641, name: "Mnagei", constituencyId: 129 },
  { id: 642, name: "Siyoi", constituencyId: 129 },
  { id: 643, name: "Endugh", constituencyId: 129 },
  { id: 644, name: "Sook", constituencyId: 129 },
  
  // West Pokot - Sigor
  { id: 645, name: "Sekerr", constituencyId: 130 },
  { id: 646, name: "Masool", constituencyId: 130 },
  { id: 647, name: "Lomut", constituencyId: 130 },
  { id: 648, name: "Weiwei", constituencyId: 130 },
  
  // West Pokot - Kacheliba
  { id: 649, name: "Suam", constituencyId: 131 },
  { id: 650, name: "Kodich", constituencyId: 131 },
  { id: 651, name: "Kasei", constituencyId: 131 },
  { id: 652, name: "Kapchok", constituencyId: 131 },
  { id: 653, name: "Kiwawa", constituencyId: 131 },
  { id: 654, name: "Alale", constituencyId: 131 },
  
  // West Pokot - Pokot South
  { id: 655, name: "Chepareria", constituencyId: 132 },
  { id: 656, name: "Batei", constituencyId: 132 },
  { id: 657, name: "Lelan", constituencyId: 132 },
  { id: 658, name: "Tapach", constituencyId: 132 },
  
  // Samburu - Samburu East
  { id: 659, name: "Waso", constituencyId: 133 },
  { id: 660, name: "Wamba West", constituencyId: 133 },
  { id: 661, name: "Wamba East", constituencyId: 133 },
  { id: 662, name: "Wamba North", constituencyId: 133 },
  
  // Samburu - Samburu North
  { id: 663, name: "El-Barta", constituencyId: 134 },
  { id: 664, name: "Nachola", constituencyId: 134 },
  { id: 665, name: "Ndoto", constituencyId: 134 },
  { id: 666, name: "Nyiro", constituencyId: 134 },
  { id: 667, name: "Angata Nanyokie", constituencyId: 134 },
  { id: 668, name: "Baawa", constituencyId: 134 },
  
  // Samburu - Samburu West
  { id: 669, name: "Lodokejek", constituencyId: 135 },
  { id: 670, name: "Suguta Marmar", constituencyId: 135 },
  { id: 671, name: "Maralal", constituencyId: 135 },
  { id: 672, name: "Loosuk", constituencyId: 135 },
  { id: 673, name: "Poro", constituencyId: 135 },
  
  // Trans-Nzoia - Cherang'any
  { id: 674, name: "Sinyerere", constituencyId: 136 },
  { id: 675, name: "Makutano", constituencyId: 136 },
  { id: 676, name: "Kaplamai", constituencyId: 136 },
  { id: 677, name: "Motosiet", constituencyId: 136 },
  { id: 678, name: "Cherangany/Suwerwa", constituencyId: 136 },
  { id: 679, name: "Chepsiro/Kiptoror", constituencyId: 136 },
  { id: 680, name: "Sitatunga", constituencyId: 136 },
  
  // Trans-Nzoia - Kwanza
  { id: 681, name: "Kapomboi", constituencyId: 137 },
  { id: 682, name: "Kwanza", constituencyId: 137 },
  { id: 683, name: "Keiyo", constituencyId: 137 },
  { id: 684, name: "Bidii", constituencyId: 137 },
  
  // Trans-Nzoia - Endebess
  { id: 685, name: "Chepchoina", constituencyId: 138 },
  { id: 686, name: "Endebess", constituencyId: 138 },
  { id: 687, name: "Matumbei", constituencyId: 138 },
  
  // Trans-Nzoia - Saboti
  { id: 688, name: "Kinyoro", constituencyId: 139 },
  { id: 689, name: "Matisi", constituencyId: 139 },
  { id: 690, name: "Tuwani", constituencyId: 139 },
  { id: 691, name: "Saboti", constituencyId: 139 },
  { id: 692, name: "Machewa", constituencyId: 139 },
  
  // Trans-Nzoia - Kiminini
  { id: 693, name: "Kiminini", constituencyId: 140 },
  { id: 694, name: "Waitaluk", constituencyId: 140 },
  { id: 695, name: "Sirende", constituencyId: 140 },
  { id: 696, name: "Hospital", constituencyId: 140 },
  { id: 697, name: "Sikhendu", constituencyId: 140 },
  { id: 698, name: "Nabiswa", constituencyId: 140 },
  
  // Uasin Gishu - Ainabkoi
  { id: 699, name: "Kapsoya", constituencyId: 141 },
  { id: 700, name: "Kaptagat", constituencyId: 141 },
  { id: 701, name: "Ainabkoi/Olare", constituencyId: 141 },
  
  // Uasin Gishu - Kapseret
  { id: 702, name: "Simat/Kapseret", constituencyId: 142 },
  { id: 703, name: "Kipkenyo", constituencyId: 142 },
  { id: 704, name: "Ngeria", constituencyId: 142 },
  { id: 705, name: "Megun", constituencyId: 142 },
  { id: 706, name: "Langas", constituencyId: 142 },
  
  // Uasin Gishu - Kesses
  { id: 707, name: "Racecourse", constituencyId: 143 },
  { id: 708, name: "Cheptiret/Kipchamo", constituencyId: 143 },
  { id: 709, name: "Tulwet/Chuiyat", constituencyId: 143 },
  { id: 710, name: "Tarakwa", constituencyId: 143 },
  
  // Uasin Gishu - Moiben
  { id: 711, name: "Tembelio", constituencyId: 144 },
  { id: 712, name: "Sergoit", constituencyId: 144 },
  { id: 713, name: "Karuna/Meibeki", constituencyId: 144 },
  { id: 714, name: "Moiben", constituencyId: 144 },
  { id: 715, name: "Kimumu", constituencyId: 144 },
  
  // Uasin Gishu - Soy
  { id: 716, name: "  Moi's Bridge", constituencyId: 145 },
  { id: 717, name: "Kapkures", constituencyId: 145 },
  { id: 718, name: "Ziwa", constituencyId: 145 },
  { id: 719, name: "Segero/Barsombe", constituencyId: 145 },
  { id: 720, name: "Kipsom Ba", constituencyId: 145 },
  { id: 721, name: "Soy", constituencyId: 145 },
  { id: 722, name: "Kuinet/Kapsuswa", constituencyId: 145 },
  
  // Uasin Gishu - Turbo
  { id: 723, name: "  Ngenyilel", constituencyId: 146 },
  { id: 724, name: "Tapsagoi", constituencyId: 146 },
  { id: 725, name: "Kamagut", constituencyId: 146 },
  { id: 726, name: "Kiplombe", constituencyId: 146 },
  { id: 727, name: "Kapsaos", constituencyId: 146 },
  { id: 728, name: "Huruma", constituencyId: 146 },
  
  // Elgeyo-Marakwet - Keiyo North
  { id: 729, name: "Emsoo", constituencyId: 147 },
  { id: 730, name: "Kamariny", constituencyId: 147 },
  { id: 731, name: "Kapchemutwa", constituencyId: 147 },
  { id: 732, name: "Tambach", constituencyId: 147 },
  
  // Elgeyo-Marakwet - Keiyo South
  { id: 733, name: "Kaptarakwa", constituencyId: 148 },
  { id: 734, name: "Chepkorio", constituencyId: 148 },
  { id: 735, name: "Soy North", constituencyId: 148 },
  { id: 736, name: "Soy South", constituencyId: 148 },
  { id: 737, name: "Kabiemit", constituencyId: 148 },
  { id: 738, name: "Metkei", constituencyId: 148 },
  
  // Elgeyo-Marakwet - Marakwet East
  { id: 739, name: "Kapyego", constituencyId: 149 },
  { id: 740, name: "Sambirir", constituencyId: 149 },
  { id: 741, name: "Endo", constituencyId: 149 },
  { id: 742, name: "Embobut / Embulot", constituencyId: 149 },
  
  // Elgeyo-Marakwet - Marakwet West
  { id: 743, name: "Kapsowar", constituencyId: 150 },
  { id: 744, name: "Lelan", constituencyId: 150 },
  { id: 745, name: "Sengwer", constituencyId: 150 },
  { id: 746, name: "Cherang'any/Chebororwa", constituencyId: 150 },
  { id: 747, name: "Moiben/Kuserwo", constituencyId: 150 },
  { id: 748, name: "Arror", constituencyId: 150 },
  
  // Nandi - Aldai
  { id: 749, name: "Kabwareng", constituencyId: 151 },
  { id: 750, name: "Terik", constituencyId: 151 },
  { id: 751, name: "Kemeloi-Maraba", constituencyId: 151 },
  { id: 752, name: "Kobujoi", constituencyId: 151 },
  { id: 753, name: "Kaptumo-Kaboi", constituencyId: 151 },
  { id: 754, name: "Koyo-Ndurio", constituencyId: 151 },
  
  // Nandi - Chesumei
  { id: 755, name: "Chemundu/Kapng'etuny", constituencyId: 152 },
  { id: 756, name: "Kosirai", constituencyId: 152 },
  { id: 757, name: "Lelmokwo/Ngechek", constituencyId: 152 },
  { id: 758, name: "Kaptel/Kamoiywo", constituencyId: 152 },
  { id: 759, name: "Kiptuya", constituencyId: 152 },
  
  // Nandi - Emgwen
  { id: 760, name: "Chepkumia", constituencyId: 153 },
  { id: 761, name: "Kapkangani", constituencyId: 153 },
  { id: 762, name: "Kapsabet", constituencyId: 153 },
  { id: 763, name: "Kilibwoni", constituencyId: 153 },
  
  // Nandi - Mosop
  { id: 764, name: "Chepterwai", constituencyId: 154 },
  { id: 765, name: "Kipkaren", constituencyId: 154 },
  { id: 766, name: "Kurgung/ Surungai", constituencyId: 154 },
  { id: 767, name: "Kabiyet", constituencyId: 154 },
  { id: 768, name: "Ndalat", constituencyId: 154 },
  { id: 769, name: "Kabisaga", constituencyId: 154 },
  { id: 770, name: "Sangalo/Kebulonik", constituencyId: 154 },
  
  // Nandi - Nandi Hills
  { id: 771, name: "Nandi Hills", constituencyId: 155 },
  { id: 772, name: "Chepkunyuk", constituencyId: 155 },
  { id: 773, name: "Ol'lessos", constituencyId: 155 },
  { id: 774, name: "Kapchorua", constituencyId: 155 },
  
  // Nandi - Tinderet
  { id: 775, name: "Songhor/Soba", constituencyId: 156 },
  { id: 776, name: "Tindiret", constituencyId: 156 },
  { id: 777, name: "Chemelil/Chemase", constituencyId: 156 },
  { id: 778, name: "Kapsimotwo", constituencyId: 156 },
  
  // Baringo - Baringo Central
  { id: 779, name: "Kabarnet", constituencyId: 157 },
  { id: 780, name: "Sacho", constituencyId: 157 },
  { id: 781, name: "Tenges", constituencyId: 157 },
  { id: 782, name: "Ewalel/Chapcha", constituencyId: 157 },
  { id: 783, name: "Kapropita", constituencyId: 157 },
  
  // Baringo - Baringo North
  { id: 784, name: "Barwessa", constituencyId: 158 },
  { id: 785, name: "Kabartonjo", constituencyId: 158 },
  { id: 786, name: "Saimo/Kipsaraman", constituencyId: 158 },
  { id: 787, name: "Saimo/Soi", constituencyId: 158 },
  { id: 788, name: "Bartabwa", constituencyId: 158 },
  
  // Baringo - Baringo South
  { id: 789, name: "Marigat", constituencyId: 159 },
  { id: 790, name: "Ilchamus", constituencyId: 159 },
  { id: 791, name: "Mochongoi", constituencyId: 159 },
  { id: 792, name: "Mukutani", constituencyId: 159 },
  
  // Baringo - Eldama Ravine
  { id: 793, name: "Lembus", constituencyId: 160 },
  { id: 794, name: "Lembus Kwen", constituencyId: 160 },
  { id: 795, name: "Ravine", constituencyId: 160 },
  { id: 796, name: "Mumberes/Maji Mazuri", constituencyId: 160 },
  { id: 797, name: "Lembus /Pekerra", constituencyId: 160 },
  
  // Baringo - Mogotio
  { id: 798, name: "Mogotio", constituencyId: 161 },
  { id: 799, name: "Emining", constituencyId: 161 },
  { id: 800, name: "Kisanana", constituencyId: 161 },
  
  // Baringo - Tiaty
  { id: 801, name: "Tirioko", constituencyId: 162 },
  { id: 802, name: "Kolowa", constituencyId: 162 },
  { id: 803, name: "Ribkwo", constituencyId: 162 },
  { id: 804, name: "Silale", constituencyId: 162 },
  { id: 805, name: "Loiyamorock", constituencyId: 162 },
  { id: 806, name: "Tangulbei/Korossi", constituencyId: 162 },
  { id: 807, name: "Churo/Amaya", constituencyId: 162 },
  
  // Laikipia - Laikipia North
  { id: 808, name: "Sosian", constituencyId: 163 },
  { id: 809, name: "Segera", constituencyId: 163 },
  { id: 810, name: "Mugogodo West", constituencyId: 163 },
  { id: 811, name: "Mugogodo East", constituencyId: 163 },
  
  // Laikipia - Laikipia East
  { id: 812, name: "Ngobit", constituencyId: 164 },
  { id: 813, name: "Tigithi", constituencyId: 164 },
  { id: 814, name: "Thingithu", constituencyId: 164 },
  { id: 815, name: "Nanyuki", constituencyId: 164 },
  { id: 816, name: " Umande", constituencyId: 164 },
  
  // Laikipia - Laikipia West
  { id: 817, name: "Ol-Moran", constituencyId: 165 },
  { id: 818, name: "Rumuruti", constituencyId: 165 },
  { id: 819, name: "Township ", constituencyId: 165 },
  { id: 820, name: "Githiga", constituencyId: 165 },
  { id: 821, name: "Marmanet", constituencyId: 165 },
  { id: 822, name: "Igwamiti Salama", constituencyId: 165 },
  
  // Nakuru - Nakuru Town East
  { id: 823, name: "Biashara", constituencyId: 166 },
  { id: 824, name: "Kivumbini", constituencyId: 166 },
  { id: 825, name: "Flamingo", constituencyId: 166 },
  { id: 826, name: "Menengai", constituencyId: 166 },
  { id: 827, name: "Nakuru East", constituencyId: 166 },
  
  // Nakuru - Nakuru Town West
  { id: 828, name: "Barut", constituencyId: 167 },
  { id: 829, name: "London", constituencyId: 167 },
  { id: 830, name: "Kaptembwo", constituencyId: 167 },
  { id: 831, name: "Kapkures", constituencyId: 167 },
  { id: 832, name: "Rhoda", constituencyId: 167 },
  { id: 833, name: "Shaabab", constituencyId: 167 },
  
  // Nakuru - Njoro
  { id: 834, name: "Mau Narok", constituencyId: 168 },
  { id: 835, name: "Mauche", constituencyId: 168 },
  { id: 836, name: "Kihingo", constituencyId: 168 },
  { id: 837, name: "Nessuit", constituencyId: 168 },
  { id: 838, name: "Lare", constituencyId: 168 },
  { id: 839, name: "Njoro", constituencyId: 168 },
  
  // Nakuru - Molo
  { id: 840, name: "Mariashoni", constituencyId: 169 },
  { id: 841, name: "Elburgon", constituencyId: 169 },
  { id: 842, name: "Turi", constituencyId: 169 },
  { id: 843, name: "Molo", constituencyId: 169 },
  
  // Nakuru - Gilgil
  { id: 844, name: "Gilgil", constituencyId: 170 },
  { id: 845, name: "Elementaita", constituencyId: 170 },
  { id: 846, name: "Mbaruk/Eburu", constituencyId: 170 },
  { id: 847, name: "Malewa West", constituencyId: 170 },
  { id: 848, name: "Murindati", constituencyId: 170 },
  
  // Nakuru - Naivasha
  { id: 849, name: "Biashara", constituencyId: 171 },
  { id: 850, name: "Hells Gate", constituencyId: 171 },
  { id: 851, name: "Lake View", constituencyId: 171 },
  { id: 852, name: "Maiella", constituencyId: 171 },
  { id: 853, name: "Mai Mahiu", constituencyId: 171 },
  { id: 854, name: "Olkaria", constituencyId: 171 },
  { id: 855, name: "Naivasha East", constituencyId: 171 },
  { id: 856, name: "Viwandani", constituencyId: 171 },
  
  // Nakuru - Kuresoi North
  { id: 857, name: "Kiptororo", constituencyId: 172 },
  { id: 858, name: "Nyota", constituencyId: 172 },
  { id: 859, name: "Sirikwa", constituencyId: 172 },
  { id: 860, name: "Kamara", constituencyId: 172 },
  
  // Nakuru - Kuresoi South
  { id: 861, name: "Amalo", constituencyId: 173 },
  { id: 862, name: "Keringet", constituencyId: 173 },
  { id: 863, name: "Kiptagich", constituencyId: 173 },
  { id: 864, name: "Tinet", constituencyId: 173 },
  
  // Nakuru - Bahati
  { id: 865, name: "Dundori", constituencyId: 174 },
  { id: 866, name: "Kabatini", constituencyId: 174 },
  { id: 867, name: "Kiamaina", constituencyId: 174 },
  { id: 868, name: "Lanet/Umoja", constituencyId: 174 },
  { id: 869, name: "Bahati", constituencyId: 174 },
  
  // Nakuru - Rongai
  { id: 870, name: "Menengai West", constituencyId: 175 },
  { id: 871, name: "Soin", constituencyId: 175 },
  { id: 872, name: "Visoi", constituencyId: 175 },
  { id: 873, name: "Mosop", constituencyId: 175 },
  { id: 874, name: "Solai", constituencyId: 175 },
  
  // Nakuru - Subukia
  { id: 875, name: "Subukia", constituencyId: 176 },
  { id: 876, name: "Waseges", constituencyId: 176 },
  { id: 877, name: "Kabazi", constituencyId: 176 },
  
  // Narok - Narok North
  { id: 878, name: "Olpusimoru", constituencyId: 177 },
  { id: 879, name: "Olokurto", constituencyId: 177 },
  { id: 880, name: "Narok Town", constituencyId: 177 },
  { id: 881, name: "Nkareta'Olorropil", constituencyId: 177 },
  { id: 882, name: "Melili", constituencyId: 177 },
  
  // Narok - Narok South
  { id: 883, name: "Majimoto/Naroos", constituencyId: 178 },
  { id: 884, name: "Uraololulung'a", constituencyId: 178 },
  { id: 885, name: "Melelo", constituencyId: 178 },
  { id: 886, name: "Loita", constituencyId: 178 },
  { id: 887, name: "Sogoo", constituencyId: 178 },
  { id: 888, name: "Sagamian", constituencyId: 178 },
  
  // Narok - Narok East
  { id: 889, name: "Mosiro", constituencyId: 179 },
  { id: 890, name: "Ildamat", constituencyId: 179 },
  { id: 891, name: "Keekonyokie", constituencyId: 179 },
  { id: 892, name: "Suswa", constituencyId: 179 },
  
  // Narok - Narok West
  { id: 893, name: "Ilmotiok", constituencyId: 180 },
  { id: 894, name: "Mara", constituencyId: 180 },
  { id: 895, name: "Siana", constituencyId: 180 },
  { id: 896, name: "Naikarra", constituencyId: 180 },
  
  // Narok - Kilgoris
  { id: 897, name: "Kilgoris Central", constituencyId: 181 },
  { id: 898, name: "Keyian", constituencyId: 181 },
  { id: 899, name: "Angata Barikoi", constituencyId: 181 },
  { id: 900, name: "Shankoe", constituencyId: 181 },
  { id: 901, name: "Kimintet", constituencyId: 181 },
  { id: 902, name: "Lolgorian", constituencyId: 181 },
  
  // Narok - Emurua Dikirr
  { id: 903, name: "Ilkerin", constituencyId: 182 },
  { id: 904, name: "Ololmasani", constituencyId: 182 },
  { id: 905, name: "Mogondo", constituencyId: 182 },
  { id: 906, name: "Kapsasian", constituencyId: 182 },
  
  // Kajiado - Kajiado Central
  { id: 907, name: "Purko", constituencyId: 183 },
  { id: 908, name: "Ildamat", constituencyId: 183 },
  { id: 909, name: "Dalalekutuk", constituencyId: 183 },
  { id: 910, name: "Matapato North", constituencyId: 183 },
  { id: 911, name: "Matapato South", constituencyId: 183 },
  
  // Kajiado - Kajiado East
  { id: 912, name: "Kaputiei North", constituencyId: 184 },
  { id: 913, name: "Kitengela", constituencyId: 184 },
  { id: 914, name: "Oloosirkon/Sholinke", constituencyId: 184 },
  { id: 915, name: "Kenyawa-Poka", constituencyId: 184 },
  { id: 916, name: "Imaroro", constituencyId: 184 },
  
  // Kajiado - Kajiado North
  { id: 917, name: "Olkeri", constituencyId: 185 },
  { id: 918, name: "Ongata Rongai", constituencyId: 185 },
  { id: 919, name: "Nkaimurunya", constituencyId: 185 },
  { id: 920, name: "Oloolua", constituencyId: 185 },
  { id: 921, name: "Ngong", constituencyId: 185 },
  
  // Kajiado - Kajiado West
  { id: 922, name: "  Keekonyokie", constituencyId: 186 },
  { id: 923, name: "Iloodokilani", constituencyId: 186 },
  { id: 924, name: "Magadi", constituencyId: 186 },
  { id: 925, name: "Ewuaso Oonkidong'i", constituencyId: 186 },
  { id: 926, name: "Mosiro", constituencyId: 186 },
  
  // Kajiado - Kajiado South
  { id: 927, name: "Entonet/Lenkisi", constituencyId: 187 },
  { id: 928, name: "Mbirikani/Eselen", constituencyId: 187 },
  { id: 929, name: "Keikuku", constituencyId: 187 },
  { id: 930, name: "Rombo", constituencyId: 187 },
  { id: 931, name: "Kimana", constituencyId: 187 },
  
  // Kericho - Ainamoi
  { id: 932, name: "Kapsoit", constituencyId: 188 },
  { id: 933, name: "Ainamoi", constituencyId: 188 },
  { id: 934, name: "Kipchebor", constituencyId: 188 },
  { id: 935, name: "Kapkugerwet", constituencyId: 188 },
  { id: 936, name: "Kipchimchim", constituencyId: 188 },
  { id: 937, name: "Kapsaos", constituencyId: 188 },
  
  // Kericho - Belgut
  { id: 938, name: "Waldai", constituencyId: 189 },
  { id: 939, name: "Kabianga", constituencyId: 189 },
  { id: 940, name: "Cheptororiet/Seretut", constituencyId: 189 },
  { id: 941, name: "Chaik", constituencyId: 189 },
  { id: 942, name: "Kapsuser", constituencyId: 189 },
  
  // Kericho - Bureti
  { id: 943, name: "Kisiara", constituencyId: 190 },
  { id: 944, name: "Tebesonik", constituencyId: 190 },
  { id: 945, name: "Cheboin", constituencyId: 190 },
  { id: 946, name: "Chemosot", constituencyId: 190 },
  { id: 947, name: "Litein", constituencyId: 190 },
  { id: 948, name: "Cheplanget", constituencyId: 190 },
  { id: 949, name: "Kapkatet", constituencyId: 190 },
  
  // Kericho - Kipkelion East
  { id: 950, name: "Londiani", constituencyId: 191 },
  { id: 951, name: "Kedowa/Kimugul", constituencyId: 191 },
  { id: 952, name: "Chepseon", constituencyId: 191 },
  { id: 953, name: "Tendeno/Sorget", constituencyId: 191 },
  
  // Kericho - Kipkelion West
  { id: 954, name: "Kunyak", constituencyId: 192 },
  { id: 955, name: "Kamasian", constituencyId: 192 },
  { id: 956, name: "Kipkelion", constituencyId: 192 },
  { id: 957, name: "Chilchila", constituencyId: 192 },
  
  // Kericho - Soin Sigowet
  { id: 958, name: "Sigowet", constituencyId: 193 },
  { id: 959, name: "Kaplelartet", constituencyId: 193 },
  { id: 960, name: "Soliat", constituencyId: 193 },
  { id: 961, name: "Soin", constituencyId: 193 },
  
  // Bomet - Sotik
  { id: 962, name: "Ndanai/Abosi", constituencyId: 194 },
  { id: 963, name: "Chemagel", constituencyId: 194 },
  { id: 964, name: "Kipsonoi", constituencyId: 194 },
  { id: 965, name: "Apletundo", constituencyId: 194 },
  { id: 966, name: "Rongena/Manare T", constituencyId: 194 },
  
  // Bomet - Bomet Central
  { id: 967, name: "Silibwet Township", constituencyId: 195 },
  { id: 968, name: "Ndaraweta", constituencyId: 195 },
  { id: 969, name: " Singorwet", constituencyId: 195 },
  { id: 970, name: "Chesoen", constituencyId: 195 },
  { id: 971, name: "Mutarakwa", constituencyId: 195 },
  
  // Bomet - Bomet East
  { id: 972, name: "Merigi", constituencyId: 196 },
  { id: 973, name: "Kembu", constituencyId: 196 },
  { id: 974, name: "Longisa", constituencyId: 196 },
  { id: 975, name: "Kipreres", constituencyId: 196 },
  { id: 976, name: "Chemaner", constituencyId: 196 },
  
  // Bomet - Chepalungu
  { id: 977, name: "  Kong'asis", constituencyId: 197 },
  { id: 978, name: " Nyangores", constituencyId: 197 },
  { id: 979, name: "Sigor", constituencyId: 197 },
  { id: 980, name: " Chebunyo", constituencyId: 197 },
  { id: 981, name: "Siongiroi", constituencyId: 197 },
  
  // Bomet - Konoin
  { id: 982, name: "Chepchabas", constituencyId: 198 },
  { id: 983, name: "Kimulot", constituencyId: 198 },
  { id: 984, name: "Mogogosiek", constituencyId: 198 },
  { id: 985, name: "Boito", constituencyId: 198 },
  { id: 986, name: " Embomos", constituencyId: 198 },
  
  // Kakamega - Butere
  { id: 987, name: "Marama West", constituencyId: 199 },
  { id: 988, name: "Marama Central", constituencyId: 199 },
  { id: 989, name: "Marenyo-Shianda", constituencyId: 199 },
  { id: 990, name: "Maram North", constituencyId: 199 },
  { id: 991, name: "Marama South", constituencyId: 199 },
  
  // Kakamega - Ikolomani
  { id: 992, name: "Idakho South", constituencyId: 200 },
  { id: 993, name: "Idakho East", constituencyId: 200 },
  { id: 994, name: "Idakho North", constituencyId: 200 },
  { id: 995, name: "Idakho Central", constituencyId: 200 },
  
  // Kakamega - Khwisero
  { id: 996, name: "Kisa North", constituencyId: 201 },
  { id: 997, name: "Kisa East", constituencyId: 201 },
  { id: 998, name: "Kisa West", constituencyId: 201 },
  { id: 999, name: "Kisa Central", constituencyId: 201 },
  
  // Kakamega - Lurambi
  { id: 1000, name: "Butsotso East", constituencyId: 202 },
  { id: 1001, name: "Butsotso South", constituencyId: 202 },
  { id: 1002, name: "Butsotso Central", constituencyId: 202 },
  { id: 1003, name: "Sheywe", constituencyId: 202 },
  { id: 1004, name: "Mahiakalo", constituencyId: 202 },
  { id: 1005, name: "Shirere", constituencyId: 202 },
  
  // Kakamega - Likuyani
  { id: 1006, name: "Likuyani", constituencyId: 203 },
  { id: 1007, name: "Sango", constituencyId: 203 },
  { id: 1008, name: "Kongoni", constituencyId: 203 },
  { id: 1009, name: "Nzoia", constituencyId: 203 },
  { id: 1010, name: "Sinoko", constituencyId: 203 },
  
  // Kakamega - Malava
  { id: 1011, name: "West Kabras", constituencyId: 204 },
  { id: 1012, name: "Chemuche East", constituencyId: 204 },
  { id: 1013, name: "Kabras", constituencyId: 204 },
  { id: 1014, name: "Butali/Chegulo", constituencyId: 204 },
  { id: 1015, name: "Manda-Shivanga", constituencyId: 204 },
  { id: 1016, name: "Shirugu-Mugai", constituencyId: 204 },
  { id: 1017, name: "South Kabras", constituencyId: 204 },
  
  // Kakamega - Matungu
  { id: 1018, name: "Koyonzo", constituencyId: 205 },
  { id: 1019, name: "Kholera", constituencyId: 205 },
  { id: 1020, name: "Khalaba", constituencyId: 205 },
  { id: 1021, name: "Mayoni", constituencyId: 205 },
  { id: 1022, name: "Namamali", constituencyId: 205 },
  
  // Kakamega - Mumias East
  { id: 1023, name: "Lusheya/Lubinu", constituencyId: 206 },
  { id: 1024, name: "Malaha/Isongo/Makunga", constituencyId: 206 },
  { id: 1025, name: "East Wanga", constituencyId: 206 },
  
  // Kakamega - Mumias West
  { id: 1026, name: "Mumias Central", constituencyId: 207 },
  { id: 1027, name: "Mumias North", constituencyId: 207 },
  { id: 1028, name: "Etenje", constituencyId: 207 },
  { id: 1029, name: "Musanda", constituencyId: 207 },
  
  // Kakamega - Navakholo
  { id: 1030, name: "Ingostse-Mathia", constituencyId: 208 },
  { id: 1031, name: "Shinoyi-Shikomari", constituencyId: 208 },
  { id: 1032, name: "Esumeyia", constituencyId: 208 },
  { id: 1033, name: "Bunyala West", constituencyId: 208 },
  { id: 1034, name: "Bunyal East", constituencyId: 208 },
  { id: 1035, name: "Bunyala Central", constituencyId: 208 },
  
  // Kakamega - Lugari
  { id: 1036, name: "Mautuma", constituencyId: 209 },
  { id: 1037, name: "Lugari", constituencyId: 209 },
  { id: 1038, name: "Lumakanda", constituencyId: 209 },
  { id: 1039, name: "Chekalini", constituencyId: 209 },
  { id: 1040, name: "Chevaywa", constituencyId: 209 },
  { id: 1041, name: "Lawandeti", constituencyId: 209 },
  
  // Kakamega - Shinyalu (Same as Lugari in source)
  { id: 1042, name: "Mautuma", constituencyId: 210 },
  { id: 1043, name: "Lugari", constituencyId: 210 },
  { id: 1044, name: "Lumakanda", constituencyId: 210 },
  { id: 1045, name: "Chekalini", constituencyId: 210 },
  { id: 1046, name: "Chevaywa", constituencyId: 210 },
  { id: 1047, name: "Lawandeti", constituencyId: 210 },
  
  // Vihiga - Emuhaya
  { id: 1048, name: "North East Bunyore", constituencyId: 211 },
  { id: 1049, name: "Central Bunyore", constituencyId: 211 },
  { id: 1050, name: "West Bunyore", constituencyId: 211 },
  
  // Vihiga - Hamisi
  { id: 1051, name: "Shiru", constituencyId: 212 },
  { id: 1052, name: "Gisambai", constituencyId: 212 },
  { id: 1053, name: "Shamakhokho", constituencyId: 212 },
  { id: 1054, name: "Banja", constituencyId: 212 },
  { id: 1055, name: "Muhudi", constituencyId: 212 },
  { id: 1056, name: "Tambaa", constituencyId: 212 },
  { id: 1057, name: "Jepkoyai", constituencyId: 212 },
  
  // Vihiga - Sabatia
  { id: 1058, name: "Lyaduywa/Izava", constituencyId: 213 },
  { id: 1059, name: "West Sabatia", constituencyId: 213 },
  { id: 1060, name: "Chavakali", constituencyId: 213 },
  { id: 1061, name: "North Maragoli", constituencyId: 213 },
  { id: 1062, name: "Wodanga", constituencyId: 213 },
  { id: 1063, name: "Busali", constituencyId: 213 },
  
  // Vihiga - Vihiga
  { id: 1064, name: "Lugaga-Wamuluma", constituencyId: 214 },
  { id: 1065, name: "South Maragoli", constituencyId: 214 },
  { id: 1066, name: "Central Maragoli", constituencyId: 214 },
  { id: 1067, name: "Mungoma", constituencyId: 214 },
  
  // Vihiga - Luanda
  { id: 1068, name: "Luanda Township", constituencyId: 215 },
  { id: 1069, name: "Wemilabi", constituencyId: 215 },
  { id: 1070, name: "Mwibona", constituencyId: 215 },
  { id: 1071, name: "Luanda South", constituencyId: 215 },
  { id: 1072, name: "Emabungo", constituencyId: 215 },
  
  // Bungoma - Bumula
  { id: 1073, name: "Bumula", constituencyId: 216 },
  { id: 1074, name: "Khasoko", constituencyId: 216 },
  { id: 1075, name: "Kabula", constituencyId: 216 },
  { id: 1076, name: "Kimaeti", constituencyId: 216 },
  { id: 1077, name: "South Bukusu", constituencyId: 216 },
  { id: 1078, name: "Siboti", constituencyId: 216 },
  
  // Bungoma - Kanduyi
  { id: 1079, name: "Bukembe West", constituencyId: 217 },
  { id: 1080, name: "Bukembe East", constituencyId: 217 },
  { id: 1081, name: "Township", constituencyId: 217 },
  { id: 1082, name: "Khalaba", constituencyId: 217 },
  { id: 1083, name: "Musikoma", constituencyId: 217 },
  { id: 1084, name: "East Snag'alo", constituencyId: 217 },
  { id: 1085, name: "Marakatu", constituencyId: 217 },
  { id: 1086, name: "Tuuti", constituencyId: 217 },
  { id: 1087, name: "West Sang'alo", constituencyId: 217 },
  
  // Bungoma - Webuye East
  { id: 1088, name: "Mihuu", constituencyId: 218 },
  { id: 1089, name: "Ndivisi", constituencyId: 218 },
  { id: 1090, name: "Maraka", constituencyId: 218 },
  
  // Bungoma - Webuye West
  { id: 1091, name: "Sitikho", constituencyId: 219 },
  { id: 1092, name: "Matulo", constituencyId: 219 },
  { id: 1093, name: "Bokoli", constituencyId: 219 },
  
  // Bungoma - Mt. Elgon
  { id: 1094, name: "Cheptais", constituencyId: 220 },
  { id: 1095, name: "Chesikaki", constituencyId: 220 },
  { id: 1096, name: "Chepyuk", constituencyId: 220 },
  { id: 1097, name: "Kapkateny", constituencyId: 220 },
  { id: 1098, name: "Kaptama", constituencyId: 220 },
  { id: 1099, name: "Elgon", constituencyId: 220 },
  
  // Bungoma - Sirisia
  { id: 1100, name: "Namwela", constituencyId: 221 },
  { id: 1101, name: "Malakisi/South Kulisiru", constituencyId: 221 },
  { id: 1102, name: "Lwandanyi", constituencyId: 221 },
  
  // Bungoma - Tongaren
  { id: 1103, name: "Mbakalo", constituencyId: 222 },
  { id: 1104, name: "Naitiri/Kabuyefwe", constituencyId: 222 },
  { id: 1105, name: "Milima", constituencyId: 222 },
  { id: 1106, name: "Ndalu/Tabani", constituencyId: 222 },
  { id: 1107, name: "Tongaren", constituencyId: 222 },
  { id: 1108, name: "Soysambu/Mitua", constituencyId: 222 },
  
  // Bungoma - Kabuchai
  { id: 1109, name: "Kabuchai/Chwele", constituencyId: 223 },
  { id: 1110, name: "West Nalondo", constituencyId: 223 },
  { id: 1111, name: "Bwake/Luuya", constituencyId: 223 },
  { id: 1112, name: "Mukuyuni", constituencyId: 223 },
  { id: 1113, name: "South Bukusu", constituencyId: 223 },
  
  // Bungoma - Kimilili
  { id: 1114, name: "Kibingei", constituencyId: 224 },
  { id: 1115, name: "Kimilili", constituencyId: 224 },
  { id: 1116, name: "Maeni", constituencyId: 224 },
  { id: 1117, name: "Kamukuywa", constituencyId: 224 },
  
  // Busia - Teso North
  { id: 1118, name: "MALABA CENTRAL", constituencyId: 225 },
  { id: 1119, name: "MALABA NORTH", constituencyId: 225 },
  { id: 1120, name: "ANG'URAI SOUTH", constituencyId: 225 },
  { id: 1121, name: "MALABA SOUTH", constituencyId: 225 },
  { id: 1122, name: "ANG'URAI NORTH", constituencyId: 225 },
  { id: 1123, name: "ANG'URAI EAST", constituencyId: 225 },
  
  // Busia - Teso South
  { id: 1124, name: "ANG'OROM", constituencyId: 226 },
  { id: 1125, name: "CHAKOI SOUTH", constituencyId: 226 },
  { id: 1126, name: "AMUKURA CENTRAL", constituencyId: 226 },
  { id: 1127, name: "CHAKOI NORTH", constituencyId: 226 },
  { id: 1128, name: "AMUKURA EAST", constituencyId: 226 },
  { id: 1129, name: "AMUKURA WEST", constituencyId: 226 },
  
  // Busia - Nambale
  { id: 1130, name: "NAMBALE TOWNSHIP", constituencyId: 227 },
  { id: 1131, name: "BUKHAYO NORTH/WALTSI", constituencyId: 227 },
  { id: 1132, name: "BUKHAYO EAST", constituencyId: 227 },
  { id: 1133, name: "BUKHAYO CENTRAL", constituencyId: 227 },
  
  // Busia - Matayos
  { id: 1134, name: "BUKHAYO WEST", constituencyId: 228 },
  { id: 1135, name: "MAYENJE", constituencyId: 228 },
  { id: 1136, name: "MATAYOS SOUTHBUSIBWABO", constituencyId: 228 },
  { id: 1137, name: "BURUMBA", constituencyId: 228 },
  
  // Busia - Butula
  { id: 1138, name: "MARACHI WESTKINGANDOLE", constituencyId: 229 },
  { id: 1139, name: "MARACHI CENTRAL", constituencyId: 229 },
  { id: 1140, name: "MARACHI EAST", constituencyId: 229 },
  { id: 1141, name: "MARACHI NORTH", constituencyId: 229 },
  { id: 1142, name: "ELUGULU", constituencyId: 229 },
  
  // Busia - Funyula
  { id: 1143, name: "NAMBOBOTO NAMBUKU", constituencyId: 230 },
  { id: 1144, name: "NANGINA", constituencyId: 230 },
  { id: 1145, name: "AGENG'A NANGUBA", constituencyId: 230 },
  { id: 1146, name: "BWIRI", constituencyId: 230 },
  
  // Siaya - Alego Usonga
  { id: 1147, name: "Usonga", constituencyId: 231 },
  { id: 1148, name: "West Alego", constituencyId: 231 },
  { id: 1149, name: "Central Alego", constituencyId: 231 },
  { id: 1150, name: "Siaya Township", constituencyId: 231 },
  { id: 1151, name: "North Alego", constituencyId: 231 },
  { id: 1152, name: "South East Alego", constituencyId: 231 },
  
  // Siaya - Gem
  { id: 1153, name: "North Gem", constituencyId: 232 },
  { id: 1154, name: "West Gem", constituencyId: 232 },
  { id: 1155, name: "Central Gem", constituencyId: 232 },
  { id: 1156, name: "Yala Township", constituencyId: 232 },
  { id: 1157, name: "East Gem", constituencyId: 232 },
  { id: 1158, name: "South Gem", constituencyId: 232 },
  
  // Siaya - Bondo
  { id: 1159, name: "West Yimbo", constituencyId: 233 },
  { id: 1160, name: "Central Sakwa", constituencyId: 233 },
  { id: 1161, name: "South Sakwa", constituencyId: 233 },
  { id: 1162, name: "Yimbo East", constituencyId: 233 },
  { id: 1163, name: "West Sakwa", constituencyId: 233 },
  { id: 1164, name: "North Sakwa", constituencyId: 233 },
  
  // Siaya - Rarieda
  { id: 1165, name: "Gem Rae", constituencyId: 234 },
  { id: 1166, name: "East Asembo", constituencyId: 234 },
  { id: 1167, name: "West Asembo", constituencyId: 234 },
  { id: 1168, name: "Central Asembo", constituencyId: 234 },
  { id: 1169, name: "South West Asembo", constituencyId: 234 },
  { id: 1170, name: "North West Asembo", constituencyId: 234 },
  { id: 1171, name: "North East Asembo", constituencyId: 234 },
  { id: 1172, name: "South East Asembo", constituencyId: 234 },
  { id: 1173, name: "Nyang'oma Kogelo", constituencyId: 234 },
  { id: 1174, name: "West Uyoma", constituencyId: 234 },
  { id: 1175, name: "Central Uyoma", constituencyId: 234 },
  { id: 1176, name: "North Uyoma", constituencyId: 234 },
  
  // Siaya - Ugenya
  { id: 1177, name: "East Asembo", constituencyId: 235 },
  { id: 1178, name: "West Asembo", constituencyId: 235 },
  { id: 1179, name: "North Uyoma", constituencyId: 235 },
  { id: 1180, name: "South Uyoma", constituencyId: 235 },
  { id: 1181, name: "West Uyoma", constituencyId: 235 },
  
  // Siaya - Ugunja
  { id: 1182, name: "Sidindi", constituencyId: 236 },
  { id: 1183, name: "Sigomere", constituencyId: 236 },
  { id: 1184, name: "Ugunja", constituencyId: 236 },
  
  // Kisumu - Kisumu Central
  { id: 1185, name: "Railways", constituencyId: 237 },
  { id: 1186, name: "Migosi", constituencyId: 237 },
  { id: 1187, name: "Shaurimoyo Kaloleni", constituencyId: 237 },
  { id: 1188, name: "Market Milimani", constituencyId: 237 },
  { id: 1189, name: "Kondele", constituencyId: 237 },
  { id: 1190, name: "Nyalenda B", constituencyId: 237 },
  
  // Kisumu - Kisumu East
  { id: 1191, name: "Kajulu", constituencyId: 238 },
  { id: 1192, name: "Kolwa East", constituencyId: 238 },
  { id: 1193, name: "Manyatta 'B'", constituencyId: 238 },
  { id: 1194, name: "Nyalenda 'A'", constituencyId: 238 },
  { id: 1195, name: "Kolwa Central", constituencyId: 238 },
  
  // Kisumu - Kisumu West
  { id: 1196, name: "South West Kisumu", constituencyId: 239 },
  { id: 1197, name: "Cetral Kisumu", constituencyId: 239 },
  { id: 1198, name: "Kisumu North", constituencyId: 239 },
  { id: 1199, name: "West Kisumu", constituencyId: 239 },
  { id: 1200, name: "North West Kisumu", constituencyId: 239 },
  
  // Kisumu - Seme
  { id: 1201, name: "West Seme", constituencyId: 240 },
  { id: 1202, name: "Central Seme", constituencyId: 240 },
  { id: 1203, name: "East Seme", constituencyId: 240 },
  { id: 1204, name: "North Seme", constituencyId: 240 },
  
  // Kisumu - Nyando
  { id: 1205, name: "East Kano/Waidhi", constituencyId: 241 },
  { id: 1206, name: "Awasi/Onjiko", constituencyId: 241 },
  { id: 1207, name: "Ahero", constituencyId: 241 },
  { id: 1208, name: "Kabonyo/Kanyag Wal", constituencyId: 241 },
  { id: 1209, name: "Kobura", constituencyId: 241 },
  
  // Kisumu - Muhoroni
  { id: 1210, name: "Miwani", constituencyId: 242 },
  { id: 1211, name: "Ombeyi", constituencyId: 242 },
  { id: 1212, name: "Masogo/Nyag'oma", constituencyId: 242 },
  { id: 1213, name: "Chemeli/Muhoroni/Koru", constituencyId: 242 },
  
  // Kisumu - Nyakach
  { id: 1214, name: "South East Nyakach", constituencyId: 243 },
  { id: 1215, name: "West Nyakach", constituencyId: 243 },
  { id: 1216, name: "North Nyakach", constituencyId: 243 },
  { id: 1217, name: "Central Nyakach", constituencyId: 243 },
  { id: 1218, name: "South West Nyakach", constituencyId: 243 },
  
  // Homa Bay - Homa Bay Town
  { id: 1219, name: "Homa Bay Central", constituencyId: 244 },
  { id: 1220, name: "Homa Bay Arujo", constituencyId: 244 },
  { id: 1221, name: "Homa Bay West", constituencyId: 244 },
  { id: 1222, name: "Homa Bay East", constituencyId: 244 },
  
  // Homa Bay - Kabondo Kasipul
  { id: 1223, name: "Kabondo East", constituencyId: 245 },
  { id: 1224, name: "Kabondo West", constituencyId: 245 },
  { id: 1225, name: "Kokwanyo", constituencyId: 245 },
  { id: 1226, name: "Kakelo-Kojwach", constituencyId: 245 },
  
  // Homa Bay - Karachuonyo
  { id: 1227, name: "West Karachuonyo", constituencyId: 246 },
  { id: 1228, name: "North Karachuonyo", constituencyId: 246 },
  { id: 1229, name: "Central Kanyaluo", constituencyId: 246 },
  { id: 1230, name: "Kibiri", constituencyId: 246 },
  { id: 1231, name: "Wangchieng", constituencyId: 246 },
  { id: 1232, name: "Kendu Bay Town", constituencyId: 246 },
  
  // Homa Bay - Kasipul
  { id: 1233, name: "West Kasipul", constituencyId: 247 },
  { id: 1234, name: "South Kasipul", constituencyId: 247 },
  { id: 1235, name: "Central Kasipul", constituencyId: 247 },
  { id: 1236, name: "East Kamagak", constituencyId: 247 },
  { id: 1237, name: "West Kamagak", constituencyId: 247 },
  
  // Homa Bay - Ndhiwa
  { id: 1238, name: "Kwabwai", constituencyId: 248 },
  { id: 1239, name: "Kanyadoto", constituencyId: 248 },
  { id: 1240, name: "Kanyikela", constituencyId: 248 },
  { id: 1241, name: "Kabuoch North", constituencyId: 248 },
  { id: 1242, name: "Kabuoch South/Pala", constituencyId: 248 },
  { id: 1243, name: "Kanyamwa Kologi", constituencyId: 248 },
  { id: 1244, name: "Kanyamwa Kosewe", constituencyId: 248 },
  
  // Homa Bay - Rangwe
  { id: 1245, name: "West Gem", constituencyId: 249 },
  { id: 1246, name: "East Gem", constituencyId: 249 },
  { id: 1247, name: "Kagan", constituencyId: 249 },
  { id: 1248, name: "Kochia", constituencyId: 249 },
  
  // Homa Bay - Suba North
  { id: 1249, name: "Mfangano Island", constituencyId: 250 },
  { id: 1250, name: "Rusinga Island", constituencyId: 250 },
  { id: 1251, name: "Kasgunga", constituencyId: 250 },
  { id: 1252, name: "Gember", constituencyId: 250 },
  { id: 1253, name: "Lambwe", constituencyId: 250 },
  
  // Homa Bay - Suba South
  { id: 1254, name: "Gwassi South", constituencyId: 251 },
  { id: 1255, name: "Gwassi North", constituencyId: 251 },
  { id: 1256, name: "Kaksingri West", constituencyId: 251 },
  { id: 1257, name: "Ruma-Kakshingri", constituencyId: 251 },
  
  // Migori - Rongo
  { id: 1258, name: "North Kamagambo", constituencyId: 252 },
  { id: 1259, name: "Central Kamagambo", constituencyId: 252 },
  { id: 1260, name: "East Kamagambo", constituencyId: 252 },
  { id: 1261, name: "South Kamagambo", constituencyId: 252 },
  
  // Migori - Awendo
  { id: 1262, name: "North East Sakwa", constituencyId: 253 },
  { id: 1263, name: "South Sakwa", constituencyId: 253 },
  { id: 1264, name: "West Sakwa", constituencyId: 253 },
  { id: 1265, name: "Central Sakwa", constituencyId: 253 },
  
  // Migori - Suna East
  { id: 1266, name: "God Jope", constituencyId: 254 },
  { id: 1267, name: "Suna Central", constituencyId: 254 },
  { id: 1268, name: "Kakrao", constituencyId: 254 },
  { id: 1269, name: "Kwa", constituencyId: 254 },
  
  // Migori - Suna West
  { id: 1270, name: "Wiga", constituencyId: 255 },
  { id: 1271, name: "Wasweta II", constituencyId: 255 },
  { id: 1272, name: "Ragan-Oruba", constituencyId: 255 },
  { id: 1273, name: "Wasimbete", constituencyId: 255 },
  
  // Migori - Uriri
  { id: 1274, name: "West Kanyamkago", constituencyId: 256 },
  { id: 1275, name: "North Kanyamkago", constituencyId: 256 },
  { id: 1276, name: "Central Kanyam Kago", constituencyId: 256 },
  { id: 1277, name: "South Kanyamkago", constituencyId: 256 },
  { id: 1278, name: "East Kanyamkago", constituencyId: 256 },
  
  // Migori - Nyatike
  { id: 1279, name: "Kachieng", constituencyId: 257 },
  { id: 1280, name: "Kanyasa", constituencyId: 257 },
  { id: 1281, name: "North Kadem", constituencyId: 257 },
  { id: 1282, name: "Macalder/ Kanyarwanda", constituencyId: 257 },
  { id: 1283, name: "Kaler", constituencyId: 257 },
  { id: 1284, name: "Got Kachola", constituencyId: 257 },
  { id: 1285, name: "Muhuru", constituencyId: 257 },
  
  // Migori - Kuria East
  { id: 1286, name: "Gokeharaka/Getamwega", constituencyId: 258 },
  { id: 1287, name: "Ntimaru West", constituencyId: 258 },
  { id: 1288, name: "Ntimaru East", constituencyId: 258 },
  { id: 1289, name: "Nyabasi East", constituencyId: 258 },
  { id: 1290, name: "Nyabasi West", constituencyId: 258 },
  
  // Migori - Kuria West
  { id: 1291, name: "Bukira East", constituencyId: 259 },
  { id: 1292, name: "Bukira Central/ Ikerege", constituencyId: 259 },
  { id: 1293, name: "Isibania", constituencyId: 259 },
  { id: 1294, name: "Makerero", constituencyId: 259 },
  { id: 1295, name: "Masaba", constituencyId: 259 },
  { id: 1296, name: "Tagare", constituencyId: 259 },
  { id: 1297, name: "Nyamosense/Ko Mosoko", constituencyId: 259 },
  
  // Kisii - Kitutu Chache North
  { id: 1298, name: "MONYERERO", constituencyId: 260 },
  { id: 1299, name: "SENSI", constituencyId: 260 },
  { id: 1300, name: "MARANI", constituencyId: 260 },
  { id: 1301, name: "MWAMONARI", constituencyId: 260 },
  
  // Kisii - Kitutu Chache South
  { id: 1302, name: "BOGUSERO", constituencyId: 261 },
  { id: 1303, name: "BOGEKA", constituencyId: 261 },
  { id: 1304, name: "NYAKOE", constituencyId: 261 },
  { id: 1305, name: "KITUTU CENTRAL", constituencyId: 261 },
  { id: 1306, name: "NYATIEKO", constituencyId: 261 },
  
  // Kisii - Nyaribari Masaba
  { id: 1307, name: "ICHUNI", constituencyId: 262 },
  { id: 1308, name: "NYAMASIBI", constituencyId: 262 },
  { id: 1309, name: "MASIMBA", constituencyId: 262 },
  { id: 1310, name: "GESUSU", constituencyId: 262 },
  { id: 1311, name: "KIAMOKAMA", constituencyId: 262 },
  
  // Kisii - Nyaribari Chache
  { id: 1312, name: "BOBARACHO", constituencyId: 263 },
  { id: 1313, name: "KISII CENTRAL", constituencyId: 263 },
  { id: 1314, name: "KEUMBU", constituencyId: 263 },
  { id: 1315, name: "KIOGORO", constituencyId: 263 },
  { id: 1316, name: "BIRONGO", constituencyId: 263 },
  { id: 1317, name: "IBENO", constituencyId: 263 },
  
  // Kisii - Bomachoge Borabu
  { id: 1318, name: "BORABU MASABA", constituencyId: 264 },
  { id: 1319, name: "BOOCHI BORABU", constituencyId: 264 },
  { id: 1320, name: "BOKIMONGE", constituencyId: 264 },
  { id: 1321, name: "MAGENCHE", constituencyId: 264 },
  
  // Kisii - Bomachoge Chache
  { id: 1322, name: "MAJOGE BASI", constituencyId: 265 },
  { id: 1323, name: "BOOCHI/TENDERE", constituencyId: 265 },
  { id: 1324, name: "BOSOTI/SENGERA", constituencyId: 265 },
  
  // Kisii - Bobasi
  { id: 1325, name: "MASIGE WEST", constituencyId: 266 },
  { id: 1326, name: "MASIG EAST", constituencyId: 266 },
  { id: 1327, name: "BASI CENTRAL", constituencyId: 266 },
  { id: 1328, name: "NYACHEKI", constituencyId: 266 },
  { id: 1329, name: "BASSI BOGETAORIO", constituencyId: 266 },
  { id: 1330, name: "BOBASI CHACHE", constituencyId: 266 },
  { id: 1331, name: "SAMETA/ MOKWERERO", constituencyId: 266 },
  { id: 1332, name: "BOBASI/ BOITANGARE", constituencyId: 266 },
  
  // Kisii - South Mugirango
  { id: 1333, name: "BOGETENGA", constituencyId: 267 },
  { id: 1334, name: "BORABU/CHITAGO", constituencyId: 267 },
  { id: 1335, name: "MOTICHO", constituencyId: 267 },
  { id: 1336, name: "GETENGA", constituencyId: 267 },
  { id: 1337, name: "TABAKA", constituencyId: 267 },
  { id: 1338, name: "BOIKANGA", constituencyId: 267 },
  
  // Kisii - Bonchari
  { id: 1339, name: "BOMARIBA", constituencyId: 268 },
  { id: 1340, name: "BOGIAKUMU", constituencyId: 268 },
  { id: 1341, name: "BOKEIRA", constituencyId: 268 },
  { id: 1342, name: "RIANA", constituencyId: 268 },
  
  // Nyamira - Borabu
  { id: 1343, name: "Mekenene", constituencyId: 269 },
  { id: 1344, name: "Kiabonyoru", constituencyId: 269 },
  { id: 1345, name: "Esise", constituencyId: 269 },
  { id: 1346, name: "Nyansiongo", constituencyId: 269 },
  
  // Nyamira - Kitutu Masaba
  { id: 1347, name: "Rigoma", constituencyId: 270 },
  { id: 1348, name: "Gachuba", constituencyId: 270 },
  { id: 1349, name: "Kemera", constituencyId: 270 },
  { id: 1350, name: "Magombo", constituencyId: 270 },
  { id: 1351, name: "Manga", constituencyId: 270 },
  { id: 1352, name: "Gesima", constituencyId: 270 },
  
  // Nyamira - West Mugirango
  { id: 1353, name: "Nyamaiya", constituencyId: 271 },
  { id: 1354, name: "Bogichora", constituencyId: 271 },
  { id: 1355, name: "Bosamaro", constituencyId: 271 },
  { id: 1356, name: "Bonyamatuta", constituencyId: 271 },
  { id: 1357, name: "Township", constituencyId: 271 },
  
  // Nyamira - North Mugirango
  { id: 1358, name: "Itibo", constituencyId: 272 },
  { id: 1359, name: "Bomwagamo", constituencyId: 272 },
  { id: 1360, name: "Bokeira", constituencyId: 272 },
  { id: 1361, name: "Magwagwa", constituencyId: 272 },
  { id: 1362, name: "Ekerenyo", constituencyId: 272 },
  
  // Nairobi - Westlands
  { id: 1363, name: "Kitisuru", constituencyId: 273 },
  { id: 1364, name: "Parklands/Highridge", constituencyId: 273 },
  { id: 1365, name: "Karura", constituencyId: 273 },
  { id: 1366, name: "Kangemi", constituencyId: 273 },
  { id: 1367, name: "Mountain View", constituencyId: 273 },
  
  // Nairobi - Dagoretti North
  { id: 1368, name: "Kilimani", constituencyId: 274 },
  { id: 1369, name: "Kawangware", constituencyId: 274 },
  { id: 1370, name: "Gatina", constituencyId: 274 },
  { id: 1371, name: "Kileleshwa", constituencyId: 274 },
  { id: 1372, name: "Kabiro", constituencyId: 274 },
  
  // Nairobi - Dagoretti South
  { id: 1373, name: "Mutu-Ini", constituencyId: 275 },
  { id: 1374, name: "Ngando", constituencyId: 275 },
  { id: 1375, name: "Riruta", constituencyId: 275 },
  { id: 1376, name: "Uthiru/Ruthimitu", constituencyId: 275 },
  { id: 1377, name: "Waithaka", constituencyId: 275 },
  
  // Nairobi - Lang'ata
  { id: 1378, name: "Karen", constituencyId: 276 },
  { id: 1379, name: "Nairobi West", constituencyId: 276 },
  { id: 1380, name: "Mugumu-Ini", constituencyId: 276 },
  { id: 1381, name: "South C", constituencyId: 276 },
  { id: 1382, name: "Nyayo Highrise", constituencyId: 276 },
  
  // Nairobi - Kibra
  { id: 1383, name: "Woodley/Kenyatta Golf Course", constituencyId: 277 },
  { id: 1384, name: "Sarang'ombe", constituencyId: 277 },
  { id: 1385, name: "Makina", constituencyId: 277 },
  { id: 1386, name: "Lindi", constituencyId: 277 },
  { id: 1387, name: "Laini Saba", constituencyId: 277 },
  
  // Nairobi - Roysambu
  { id: 1388, name: "Kahawa West", constituencyId: 278 },
  { id: 1389, name: "Roysambu", constituencyId: 278 },
  { id: 1390, name: "Githurai", constituencyId: 278 },
  { id: 1391, name: "Kahawa", constituencyId: 278 },
  { id: 1392, name: "Zimmerman", constituencyId: 278 },
  
  // Nairobi - Kasarani
  { id: 1393, name: "Kasarani", constituencyId: 279 },
  { id: 1394, name: "Njiru", constituencyId: 279 },
  { id: 1395, name: "Clay City", constituencyId: 279 },
  { id: 1396, name: "Mwiki", constituencyId: 279 },
  { id: 1397, name: "Ruai", constituencyId: 279 },
  
  // Nairobi - Ruaraka
  { id: 1398, name: "Utalii", constituencyId: 280 },
  { id: 1399, name: "Korogocho", constituencyId: 280 },
  { id: 1400, name: "Lucky Summer", constituencyId: 280 },
  { id: 1401, name: "Mathare North", constituencyId: 280 },
  { id: 1402, name: "Baba Dogo", constituencyId: 280 },
  
  // Nairobi - Embakasi South
  { id: 1403, name: "Kwa Njenga", constituencyId: 281 },
  { id: 1404, name: "Imara Daima", constituencyId: 281 },
  { id: 1405, name: "Kware", constituencyId: 281 },
  { id: 1406, name: "Kwa Reuben", constituencyId: 281 },
  { id: 1407, name: "Pipeline", constituencyId: 281 },
  
  // Nairobi - Embakasi North
  { id: 1408, name: "Dandora Area I", constituencyId: 282 },
  { id: 1409, name: "Dandora Area II", constituencyId: 282 },
  { id: 1410, name: "Dandora Area III", constituencyId: 282 },
  { id: 1411, name: "Dandora Area IV", constituencyId: 282 },
  { id: 1412, name: "Kariobangi North", constituencyId: 282 },
  
  // Nairobi - Embakasi Central
  { id: 1413, name: "Kayole North", constituencyId: 283 },
  { id: 1414, name: "Kayole Central", constituencyId: 283 },
  { id: 1415, name: "Kariobangi South", constituencyId: 283 },
  { id: 1416, name: "Komarock", constituencyId: 283 },
  { id: 1417, name: "Matopeni / Spring Valley", constituencyId: 283 },
  
  // Nairobi - Embakasi East
  { id: 1418, name: "Utawala", constituencyId: 284 },
  { id: 1419, name: "Upper Savanna", constituencyId: 284 },
  { id: 1420, name: "Lower Savanna", constituencyId: 284 },
  { id: 1421, name: "Embakasi", constituencyId: 284 },
  { id: 1422, name: "Mihango", constituencyId: 284 },
  
  // Nairobi - Embakasi West
  { id: 1423, name: "Umoja 1", constituencyId: 285 },
  { id: 1424, name: "Umoja 2", constituencyId: 285 },
  { id: 1425, name: "Mowlem ", constituencyId: 285 },
  { id: 1426, name: "Kariobangi south", constituencyId: 285 },
  { id: 1427, name: "Maringo/ Hamza", constituencyId: 285 },
  
  // Nairobi - Makadara
  { id: 1428, name: "Viwandani", constituencyId: 286 },
  { id: 1429, name: "Harambee", constituencyId: 286 },
  { id: 1430, name: "Makongeni", constituencyId: 286 },
  { id: 1431, name: "Pumwani", constituencyId: 286 },
  { id: 1432, name: "Eastleigh North", constituencyId: 286 },
  
  // Nairobi - Kamukunji
  { id: 1433, name: "Eastleigh South", constituencyId: 287 },
  { id: 1434, name: "Nairobi Central", constituencyId: 287 },
  { id: 1435, name: "Airbase", constituencyId: 287 },
  { id: 1436, name: "California", constituencyId: 287 },
  { id: 1437, name: "Mgara", constituencyId: 287 },
  
  // Nairobi - Starehe
  { id: 1438, name: "Nairobi South", constituencyId: 288 },
  { id: 1439, name: "Hospital", constituencyId: 288 },
  { id: 1440, name: "Ngara", constituencyId: 288 },
  { id: 1441, name: "Pangani", constituencyId: 288 },
  { id: 1442, name: "Landimawe", constituencyId: 288 },
  { id: 1443, name: "Ziwani / Kariokor", constituencyId: 288 },
  
  // Nairobi - Mathare
  { id: 1444, name: "Mlango Kubwa", constituencyId: 289 },
  { id: 1445, name: "Kiamaiko", constituencyId: 289 },
  { id: 1446, name: "Ngei", constituencyId: 289 },
  { id: 1447, name: "Huruma", constituencyId: 289 },
  { id: 1448, name: "Mabatini", constituencyId: 289 }


  ]);
  loading = signal(false);
  voterCode = signal('');
  showSuccess = signal(false);

  onCountyChange() {
    this.form.controls.constituency.setValue('');
    this.form.controls.ward.setValue('');
    this.filteredWards.set([]);

    const countyId = this.form.controls.county.value;
    if (countyId) {
      this.filteredConstituencies.set(
        this.constituencies().filter(c => c.countyId == countyId)
      );
    } else {
      this.filteredConstituencies.set([]);
    }
  }

  onConstituencyChange() {
    this.form.controls.ward.setValue('');

    const constituencyId = this.form.controls.constituency.value;
    if (constituencyId) {
      this.filteredWards.set(
        this.wards().filter((w: { constituencyId: string }) => w.constituencyId == constituencyId)
      );
    } else {
      this.filteredWards.set([]);
    }
  }

  register() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const v = this.form.getRawValue();

    // Resolve names from the selected IDs.
    const countyName = this.counties.find(c => String(c.id) === v.county)?.name ?? '';
    const constituencyName = this.filteredConstituencies().find(c => String(c.id) === v.constituency)?.name ?? '';
    const wardName = this.filteredWards().find(w => String(w.id) === v.ward)?.name ?? '';

    const data = {
      full_name: v.fullName,
      id_number: v.idNumber,
      phone_number: v.phone,
      email: v.email || undefined,
      county: countyName,
      constituency: constituencyName,
      ward: wardName,
      password: v.password,
    };

    this.votingService.registerVoter(data).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.voterCode.set(response.voter_code);
        this.showSuccess.set(true);
        this.form.reset({ phone: '+254' });
      },
      error: (err) => {
        this.loading.set(false);
        alert('Registration failed: ' + (err.error?.id_number?.[0] || 'Error occurred'));
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
