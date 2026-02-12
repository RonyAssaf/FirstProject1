import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';

// google-libphonenumber
import * as libphonenumber from 'google-libphonenumber';

interface RestCountry {
  name: { common: string };
  cca2: string;
  idd?: { root?: string; suffixes?: string[] };
  flags?: { png?: string; svg?: string };
}

export interface CountryOption {
  name: string;
  code: string; // ISO2 e.g. "LB"
  dialCode: string; // e.g. "+961"
  flagPng: string;
}

@Component({
  selector: 'app-phone-input',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ReactiveFormsModule, SelectModule, FormsModule],
  templateUrl: 'phone-input.html',
  styleUrls: ['phone-input.component.scss'],
})
export class PhoneInputComponent implements OnInit {
  // ---------------------------
  // Inputs (configuration)
  // ---------------------------
  @Input() defaultIso: string = 'LB';

  /**
   * If true: number must be mobile (or fixed_line_or_mobile).
   * If false: any valid number type passes.
   */
  @Input() onlyMobile: boolean = true;

  /**
   * If true: display input like +96170377444 (no spaces).
   * If false: keep libphonenumber spacing.
   */
  @Input() compactDisplay: boolean = true;

  // ---------------------------
  // Outputs (to parent)
  // ---------------------------
  @Output() valueChange = new EventEmitter<string | null>(); // E.164
  @Output() validChange = new EventEmitter<boolean>();
  @Output() countryChange = new EventEmitter<CountryOption>();

  // ---------------------------
  // UI state
  // ---------------------------
  countries: CountryOption[] = [];
  selectedCountry: CountryOption | null = null;

  // ---------------------------
  // Errors UI
  // ---------------------------
  phoneError: 'invalid' | 'notMobile' | null = null;
  private userInteracted = false;

  // input control lives inside component
  phoneCtrl = new FormControl<string>('', { nonNullable: true, validators: [Validators.required] });

  // internal state (like intl-tel-input)
  private region = 'LB';
  private dialCode = '+961';
  private phoneE164: string | null = null;

  // libphonenumber
  private readonly phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();

  // dial code -> country
  private dialToCountry = new Map<string, CountryOption>();
  private dialPrefixesDesc: string[] = [];

  // max digits per region cache
  private maxDigitsByRegion = new Map<string, number>();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCountries();
  }

  // ===========================================================
  // Countries
  // ===========================================================
  private loadCountries(): void {
    const url = 'https://restcountries.com/v3.1/all?fields=name,cca2,idd,flags';

    this.http.get<RestCountry[]>(url).subscribe({
      next: (list) => {
        this.countries = (list || [])
          .map((c) => this.mapRestCountryToOption(c))
          .filter((x): x is CountryOption => !!x)
          .sort((a, b) => a.name.localeCompare(b.name));

        this.dialToCountry.clear();
        for (const c of this.countries) {
          if (c.dialCode) this.dialToCountry.set(c.dialCode, c);
        }

        this.dialPrefixesDesc = Array.from(this.dialToCountry.keys()).sort(
          (a, b) => b.length - a.length,
        );

        const def =
          this.countries.find((c) => c.code === this.defaultIso) ?? this.countries[0] ?? null;
        if (def) this.applyCountry(def);

        // emit initial validity/value
        this.emitState();
      },
      error: (err) => console.error('Failed to load countries', err),
    });
  }

  private mapRestCountryToOption(c: RestCountry): CountryOption | null {
    const name = c?.name?.common?.trim();
    const code = c?.cca2?.trim();
    const flagPng = c?.flags?.png ?? '';

    const root = c?.idd?.root ?? '';
    const suffix = c?.idd?.suffixes?.[0] ?? '';
    const dialCode = (root + suffix).trim();

    if (!name || !code || !dialCode.startsWith('+')) return null;
    return { name, code, dialCode, flagPng };
  }

  onCountryChange(country: CountryOption): void {
    if (!country) return;
    this.applyCountry(country);

    // If user already has some national digits typed (or full +...), re-apply formatting
    const normalized = this.normalizeAllowPlus(this.phoneCtrl.value);

    const hasPlus = normalized.startsWith('+');
    const nationalDigits = hasPlus
      ? this.extractNationalDigitsFromInternational(normalized, this.dialCode)
      : normalized.replace(/\D/g, '');

    const limitedDigits = this.limitDigitsForRegion(nationalDigits, this.region);
    const full = `${this.dialCode}${limitedDigits}`;

    // keep + in input
    const display = this.normalizeDisplay(this.formatAsYouTypeInternational(full, this.region));
    this.phoneCtrl.setValue(display, { emitEvent: false });

    // validate + emit
    this.validateFromNationalDigits(limitedDigits);
    this.countryChange.emit(country);
  }

  private applyCountry(country: CountryOption): void {
    this.selectedCountry = country;
    this.region = country.code;
    this.dialCode = country.dialCode;
  }

  // ===========================================================
  // Input logic
  // ===========================================================
  onPhoneInput(evt: Event): void {
    this.userInteracted = true;
    const input = evt.target as HTMLInputElement;

    const normalized = this.normalizeAllowPlus(input.value);

    // allow typing just "+" without it getting erased
    const digitsAfterPlus = normalized.startsWith('+')
      ? normalized.slice(1).replace(/\D/g, '')
      : '';
    if (normalized === '+' || (normalized.startsWith('+') && digitsAfterPlus.length < 2)) {
      input.value = normalized;
      this.phoneCtrl.setValue(normalized, { emitEvent: false });

      // don't spam errors for just "+"
      this.setValidityAndError(false, null, 'invalid');

      return;
    }

    // International typing
    if (normalized.startsWith('+')) {
      const detected = this.detectCountryFromDialCode(normalized);

      if (detected && (!this.selectedCountry || detected.code !== this.selectedCountry.code)) {
        this.applyCountry(detected);
        this.countryChange.emit(detected);
      }

      if (!detected) {
        input.value = normalized;
        this.phoneCtrl.setValue(normalized, { emitEvent: false });
        this.setValidityAndError(false, null, 'invalid');

        return;
      }

      const nationalDigits = this.extractNationalDigitsFromInternational(normalized, this.dialCode);
      const limitedDigits = this.limitDigitsForRegion(nationalDigits, this.region);

      const full = `${this.dialCode}${limitedDigits}`;
      const display = this.normalizeDisplay(this.formatAsYouTypeInternational(full, this.region));

      input.value = display;
      this.phoneCtrl.setValue(display, { emitEvent: false });

      this.validateFromNationalDigits(limitedDigits);
      return;
    }

    // National typing
    const digits = normalized.replace(/\D/g, '');
    const limitedDigits = this.limitDigitsForRegion(digits, this.region);

    // Display should include +dialCode (per your requirement)
    const full = `${this.dialCode}${limitedDigits}`;
    const display = this.normalizeDisplay(this.formatAsYouTypeInternational(full, this.region));

    input.value = display;
    this.phoneCtrl.setValue(display, { emitEvent: false });

    this.validateFromNationalDigits(limitedDigits);
  }

  private detectCountryFromDialCode(value: string): CountryOption | null {
    const compact = value.replace(/\s/g, '');
    for (const prefix of this.dialPrefixesDesc) {
      if (compact.startsWith(prefix)) return this.dialToCountry.get(prefix) ?? null;
    }
    return null;
  }

  private extractNationalDigitsFromInternational(raw: string, dialCode: string): string {
    const compact = raw.replace(/[^\d+]/g, '');
    if (dialCode && compact.startsWith(dialCode)) {
      return compact.slice(dialCode.length).replace(/\D/g, '');
    }
    return compact.replace(/^\+\d+/, '').replace(/\D/g, '');
  }

  // ===========================================================
  // Formatting helpers
  // ===========================================================
  private formatAsYouTypeInternational(fullDigitsWithPlus: string, region: string): string {
    const AsYouTypeFormatter = libphonenumber.AsYouTypeFormatter;
    const formatter = new AsYouTypeFormatter(region);

    let out = '';
    for (const ch of fullDigitsWithPlus) {
      if (ch === '+') out = formatter.inputDigit('+');
      else if (/\d/.test(ch)) out = formatter.inputDigit(ch);
    }
    return out;
  }

  private normalizeDisplay(display: string): string {
    // if compactDisplay = true, remove spaces/dashes/paren, keep only + and digits
    return this.compactDisplay ? display.replace(/[^\d+]/g, '') : display;
  }

  private normalizeAllowPlus(value: string): string {
    const v = (value ?? '').toString().trim();
    let cleaned = v.replace(/[^\d+]/g, '');
    if (cleaned.includes('+')) {
      cleaned = '+' + cleaned.replace(/\+/g, '').replace(/^\+?/, '');
    }
    return cleaned;
  }

  // ===========================================================
  // Max digits
  // ===========================================================
  private limitDigitsForRegion(nationalDigits: string, region: string): string {
    const maxDigits = this.getMaxDigitsForRegion(region);
    return nationalDigits.slice(0, maxDigits);
  }

  private getMaxDigitsForRegion(region: string): number {
    const cached = this.maxDigitsByRegion.get(region);
    if (cached) return cached;

    try {
      const PNF = libphonenumber.PhoneNumberFormat;
      const PNT = libphonenumber.PhoneNumberType;

      const exMobile = this.phoneUtil.getExampleNumberForType(region, PNT.MOBILE);
      const ex =
        exMobile || this.phoneUtil.getExampleNumberForType(region, PNT.FIXED_LINE_OR_MOBILE);

      if (!ex) {
        this.maxDigitsByRegion.set(region, 15);
        return 15;
      }

      const national = this.phoneUtil.format(ex, PNF.NATIONAL);
      const digitCount = (national.match(/\d/g) ?? []).length;
      this.maxDigitsByRegion.set(region, digitCount);
      return digitCount;
    } catch {
      this.maxDigitsByRegion.set(region, 15);
      return 15;
    }
  }

  // ===========================================================
  // Validation + E.164
  // ===========================================================
  private validateFromNationalDigits(nationalDigits: string): void {
    const full = `${this.dialCode}${nationalDigits}`;
    const { isValid, e164, reason } = this.validateAndToE164(full, this.region);

    // show errors only after user starts typing something meaningful
    const hasSomeDigits = (nationalDigits ?? '').replace(/\D/g, '').length > 0;
    const uiReason = this.userInteracted && hasSomeDigits ? reason : null;

    this.setValidityAndError(isValid, e164, uiReason);
  }

  private validateAndToE164(
    fullNumber: string,
    region: string,
  ): { isValid: boolean; e164: string | null; reason: 'invalid' | 'notMobile' | null } {
    if (!fullNumber) return { isValid: false, e164: null, reason: 'invalid' };

    try {
      const num = this.phoneUtil.parseAndKeepRawInput(fullNumber, region);

      const isPossible = this.phoneUtil.isPossibleNumber(num);
      const isValidForRegion = this.phoneUtil.isValidNumberForRegion(num, region);
      if (!isPossible || !isValidForRegion) {
        return { isValid: false, e164: null, reason: 'invalid' };
      }

      // valid number but not mobile
      if (this.onlyMobile && !this.isMobileNumber(num)) {
        return { isValid: false, e164: null, reason: 'notMobile' };
      }

      const PhoneNumberFormat = libphonenumber.PhoneNumberFormat;
      const e164 = this.phoneUtil.format(num, PhoneNumberFormat.E164);
      return { isValid: true, e164, reason: null };
    } catch {
      return { isValid: false, e164: null, reason: 'invalid' };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private isMobileNumber(num: any): boolean {
    const PNT = libphonenumber.PhoneNumberType;
    const type = this.phoneUtil.getNumberType(num);
    return type === PNT.MOBILE || type === PNT.FIXED_LINE_OR_MOBILE;
  }

  private setValidityAndError(
    valid: boolean,
    e164: string | null,
    reason: 'invalid' | 'notMobile' | null,
  ): void {
    this.phoneE164 = valid ? e164 : null;
    this.phoneError = valid ? null : reason;

    // Set reactive-form errors so template can show messages
    if (valid) {
      // keep required validator behavior; clear custom errors
      this.phoneCtrl.setErrors(null);
    } else {
      // if empty, let "required" handle it, otherwise show our custom errors
      const hasValue = (this.phoneCtrl.value ?? '').trim().length > 0;
      if (!hasValue) {
        this.phoneCtrl.setErrors({ required: true });
      } else if (reason === 'notMobile') {
        this.phoneCtrl.setErrors({ notMobile: true });
      } else if (reason === 'invalid') {
        this.phoneCtrl.setErrors({ invalidPhone: true });
      } else {
        this.phoneCtrl.setErrors(null);
      }
    }

    this.validChange.emit(valid);
    this.valueChange.emit(this.phoneE164);
  }

  private emitState(): void {
    this.phoneError = null;
    this.validChange.emit(false);
    this.valueChange.emit(null);
  }
}
