export interface CountryCode {
  code: string;       // ISO 3166-1 alpha-2
  name: string;
  dialCode: string;
  flag: string;
  minDigits: number;  // minimum digits (excluding country code)
  maxDigits: number;  // maximum digits (excluding country code)
}

const countryCodes: CountryCode[] = [
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', minDigits: 10, maxDigits: 10 },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', minDigits: 10, maxDigits: 10 },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', minDigits: 10, maxDigits: 11 },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', minDigits: 10, maxDigits: 10 },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', minDigits: 9, maxDigits: 9 },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', minDigits: 10, maxDigits: 11 },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', minDigits: 9, maxDigits: 9 },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', minDigits: 10, maxDigits: 11 },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳', minDigits: 11, maxDigits: 11 },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷', minDigits: 10, maxDigits: 11 },
  { code: 'AE', name: 'UAE', dialCode: '+971', flag: '🇦🇪', minDigits: 9, maxDigits: 9 },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', minDigits: 8, maxDigits: 8 },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾', minDigits: 9, maxDigits: 10 },
  { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭', minDigits: 10, maxDigits: 10 },
  { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩', minDigits: 9, maxDigits: 12 },
  { code: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭', minDigits: 9, maxDigits: 9 },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷', minDigits: 10, maxDigits: 11 },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', minDigits: 9, maxDigits: 9 },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦', minDigits: 9, maxDigits: 9 },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬', minDigits: 10, maxDigits: 11 },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪', minDigits: 9, maxDigits: 9 },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬', minDigits: 10, maxDigits: 10 },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹', minDigits: 9, maxDigits: 11 },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸', minDigits: 9, maxDigits: 9 },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱', minDigits: 9, maxDigits: 9 },
  { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪', minDigits: 9, maxDigits: 10 },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭', minDigits: 9, maxDigits: 9 },
  { code: 'PL', name: 'Poland', dialCode: '+48', flag: '🇵🇱', minDigits: 9, maxDigits: 9 },
  { code: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺', minDigits: 10, maxDigits: 10 },
  { code: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷', minDigits: 10, maxDigits: 10 },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽', minDigits: 10, maxDigits: 10 },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷', minDigits: 10, maxDigits: 11 },
  { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱', minDigits: 9, maxDigits: 9 },
  { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴', minDigits: 10, maxDigits: 10 },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿', minDigits: 8, maxDigits: 10 },
  { code: 'IE', name: 'Ireland', dialCode: '+353', flag: '🇮🇪', minDigits: 9, maxDigits: 9 },
  { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹', minDigits: 9, maxDigits: 9 },
  { code: 'AT', name: 'Austria', dialCode: '+43', flag: '🇦🇹', minDigits: 10, maxDigits: 11 },
  { code: 'BE', name: 'Belgium', dialCode: '+32', flag: '🇧🇪', minDigits: 9, maxDigits: 9 },
  { code: 'DK', name: 'Denmark', dialCode: '+45', flag: '🇩🇰', minDigits: 8, maxDigits: 8 },
  { code: 'FI', name: 'Finland', dialCode: '+358', flag: '🇫🇮', minDigits: 9, maxDigits: 10 },
  { code: 'NO', name: 'Norway', dialCode: '+47', flag: '🇳🇴', minDigits: 8, maxDigits: 8 },
  { code: 'IL', name: 'Israel', dialCode: '+972', flag: '🇮🇱', minDigits: 9, maxDigits: 9 },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰', minDigits: 10, maxDigits: 10 },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩', minDigits: 10, maxDigits: 10 },
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94', flag: '🇱🇰', minDigits: 9, maxDigits: 9 },
  { code: 'NP', name: 'Nepal', dialCode: '+977', flag: '🇳🇵', minDigits: 10, maxDigits: 10 },
  { code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳', minDigits: 9, maxDigits: 10 },
  { code: 'HK', name: 'Hong Kong', dialCode: '+852', flag: '🇭🇰', minDigits: 8, maxDigits: 8 },
  { code: 'TW', name: 'Taiwan', dialCode: '+886', flag: '🇹🇼', minDigits: 9, maxDigits: 9 },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦', minDigits: 8, maxDigits: 8 },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼', minDigits: 8, maxDigits: 8 },
  { code: 'BH', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭', minDigits: 8, maxDigits: 8 },
  { code: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲', minDigits: 8, maxDigits: 8 },
];

export default countryCodes;
