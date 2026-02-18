// ── 4D Benchmark System: Channel × Vertical × GEO × Platform ───────────────────
// Formula: final = base[channel] × verticalMult[vertical] × geoMult[geoTier] × platformMult[platform]
// CTR values are in PERCENT (e.g. 1.2 = 1.2%), CPI in USD

// ── 1. Base values per channel ──────────────────────────────────────────────────

const CHANNEL_BENCHMARKS = {
    // OEM / preinstall sources
    xiaomi:     { ctr: 1.2,  crInstall: 2.5,  cpi: 1.00 },
    huawei:     { ctr: 1.0,  crInstall: 3.2,  cpi: 1.20 },
    samsung:    { ctr: 1.1,  crInstall: 0.5,  cpi: 1.10 },
    oppo:       { ctr: 1.0,  crInstall: 0.4,  cpi: 1.00 },
    vivo:       { ctr: 1.0,  crInstall: 0.4,  cpi: 1.00 },
    realme:     { ctr: 1.0,  crInstall: 0.4,  cpi: 0.90 },
    transsion:  { ctr: 0.9,  crInstall: 0.3,  cpi: 0.80 },
    // Performance channels
    facebook:   { ctr: 1.5,  crInstall: 3.0,  cpi: 2.50 },
    meta:       { ctr: 1.5,  crInstall: 3.0,  cpi: 2.50 },
    google:     { ctr: 2.0,  crInstall: 2.5,  cpi: 2.80 },
    tiktok:     { ctr: 0.8,  crInstall: 1.5,  cpi: 3.00 },
    unity:      { ctr: 1.8,  crInstall: 2.0,  cpi: 1.80 },
    applovin:   { ctr: 1.6,  crInstall: 1.8,  cpi: 2.20 },
    ironsource: { ctr: 1.5,  crInstall: 1.7,  cpi: 2.00 },
    mintegral:  { ctr: 1.2,  crInstall: 1.5,  cpi: 1.80 },
    appnext:    { ctr: 0.9,  crInstall: 5.0,  cpi: 1.50 },
    xapads:     { ctr: 0.8,  crInstall: 4.0,  cpi: 1.20 },
    yandex:     { ctr: 1.4,  crInstall: 2.0,  cpi: 1.50 },
    vk:         { ctr: 1.2,  crInstall: 1.5,  cpi: 1.60 },
    snapchat:   { ctr: 0.7,  crInstall: 1.3,  cpi: 3.50 },
    twitter:    { ctr: 0.5,  crInstall: 1.0,  cpi: 4.50 },
    x:          { ctr: 0.5,  crInstall: 1.0,  cpi: 4.50 },
    moloco:     { ctr: 1.3,  crInstall: 1.6,  cpi: 2.00 },
    liftoff:    { ctr: 1.2,  crInstall: 1.5,  cpi: 2.50 },
    digital_turbine: { ctr: 1.0, crInstall: 0.6, cpi: 0.90 },
    // Default fallback
    _default:   { ctr: 1.2,  crInstall: 1.0,  cpi: 2.00 }
};

// ── 2. Vertical multipliers ────────────────────────────────────────────────────
// Multiplier 1.0 = neutral (same as current behavior for "other")
// Based on industry benchmarks: AppsFlyer, Adjust, Singular 2024-2025

const VERTICAL_MULTIPLIERS = {
    gaming:        { ctr: 1.80, crInstall: 1.30, cpi: 0.50 },  // Cheap installs, high CTR
    entertainment: { ctr: 1.40, crInstall: 1.15, cpi: 0.70 },  // High engagement
    social:        { ctr: 1.30, crInstall: 1.20, cpi: 0.75 },  // Strong network effects
    health:        { ctr: 1.10, crInstall: 1.00, cpi: 1.10 },  // Moderate
    utilities:     { ctr: 1.10, crInstall: 0.95, cpi: 0.85 },  // Functional, moderate
    education:     { ctr: 1.00, crInstall: 0.90, cpi: 0.90 },  // Considered decision
    ecommerce:     { ctr: 0.90, crInstall: 0.85, cpi: 1.30 },  // Competitive market
    travel:        { ctr: 0.90, crInstall: 0.85, cpi: 1.25 },  // Seasonal, competitive
    delivery:      { ctr: 0.85, crInstall: 0.80, cpi: 1.20 },  // Market-dependent
    finance:       { ctr: 0.75, crInstall: 0.70, cpi: 2.50 },  // Most expensive installs
    pharma:        { ctr: 0.80, crInstall: 0.75, cpi: 2.00 },  // Regulated, expensive
    other:         { ctr: 1.00, crInstall: 1.00, cpi: 1.00 }   // Neutral default
};

// ── 3. GEO tier multipliers ────────────────────────────────────────────────────
// Tier 1: High-income markets — baseline
// Tier 2: Mid-income — slightly higher CTR (less ad fatigue), cheaper installs
// Tier 3: Emerging — highest CTR, cheapest installs

const GEO_TIER_MULTIPLIERS = {
    tier1: { ctr: 1.00, crInstall: 1.00, cpi: 1.00 },  // US/EU baseline
    tier2: { ctr: 1.10, crInstall: 0.80, cpi: 0.45 },  // RU/BR/IN — cheaper installs
    tier3: { ctr: 1.15, crInstall: 0.60, cpi: 0.20 }   // Emerging — cheapest installs
};

// ── 4. Platform multipliers (Android vs iOS) ─────────────────────────────────
// Android = baseline (1.0). iOS adjustments based on AppsFlyer Performance Index.
// iOS: higher CTR (better ad creatives/engagement), lower CR (stricter users),
// significantly higher CPI (premium audience, higher LTV expectations).

const PLATFORM_MULTIPLIERS = {
    Android: { ctr: 1.00, crInstall: 1.00, cpi: 1.00 },  // baseline
    iOS:     { ctr: 1.25, crInstall: 0.85, cpi: 2.50 }   // iOS: +25% CTR, −15% CR, 2.5× CPI
};

// ── 5. Country → Tier mapping ──────────────────────────────────────────────────
// ~65 countries explicitly mapped; rest default to tier3

const COUNTRY_TO_TIER = {
    // Tier 1 — High-income
    US: 'tier1', GB: 'tier1', DE: 'tier1', FR: 'tier1', JP: 'tier1',
    KR: 'tier1', AU: 'tier1', CA: 'tier1', IT: 'tier1', ES: 'tier1',
    NL: 'tier1', CH: 'tier1', SE: 'tier1', NO: 'tier1', DK: 'tier1',
    FI: 'tier1', AT: 'tier1', BE: 'tier1', IE: 'tier1', SG: 'tier1',
    HK: 'tier1', NZ: 'tier1', IL: 'tier1', AE: 'tier1', SA: 'tier1',
    QA: 'tier1', KW: 'tier1', TW: 'tier1', LU: 'tier1', PT: 'tier1',

    // Tier 2 — Mid-income / large markets
    RU: 'tier2', BR: 'tier2', MX: 'tier2', IN: 'tier2', ID: 'tier2',
    TH: 'tier2', TR: 'tier2', PL: 'tier2', CZ: 'tier2', RO: 'tier2',
    HU: 'tier2', GR: 'tier2', AR: 'tier2', CL: 'tier2', CO: 'tier2',
    PE: 'tier2', MY: 'tier2', PH: 'tier2', VN: 'tier2', ZA: 'tier2',
    EG: 'tier2', MA: 'tier2', CN: 'tier2', HR: 'tier2', BG: 'tier2',
    RS: 'tier2', SK: 'tier2', SI: 'tier2', LT: 'tier2', LV: 'tier2',
    EE: 'tier2', BY: 'tier2', GE: 'tier2', AZ: 'tier2',

    // Everything else → tier3 (handled by getGeoTier fallback)
};

// ── 6. GEO text aliases ────────────────────────────────────────────────────────
// Common country name → ISO 2-letter code

const GEO_ALIASES = {
    'russia': 'RU', 'rossiya': 'RU', 'russian': 'RU',
    'usa': 'US', 'united states': 'US', 'america': 'US',
    'uk': 'GB', 'united kingdom': 'GB', 'england': 'GB', 'britain': 'GB',
    'germany': 'DE', 'deutschland': 'DE',
    'france': 'FR', 'japan': 'JP', 'korea': 'KR', 'south korea': 'KR',
    'brazil': 'BR', 'brasil': 'BR',
    'india': 'IN', 'indonesia': 'ID',
    'turkey': 'TR', 'turkiye': 'TR',
    'mexico': 'MX', 'thailand': 'TH',
    'kazakhstan': 'KZ', 'ukraine': 'UA',
    'china': 'CN', 'prc': 'CN',
    'philippines': 'PH', 'vietnam': 'VN', 'vn': 'VN',
    'malaysia': 'MY', 'singapore': 'SG',
    'egypt': 'EG', 'south africa': 'ZA',
    'poland': 'PL', 'czech': 'CZ', 'czechia': 'CZ',
    'argentina': 'AR', 'colombia': 'CO', 'peru': 'PE', 'chile': 'CL',
    'uae': 'AE', 'emirates': 'AE',
    'saudi': 'SA', 'saudi arabia': 'SA',
    'nigeria': 'NG', 'pakistan': 'PK', 'bangladesh': 'BD',
    'uzbekistan': 'UZ', 'kenya': 'KE',
    'italy': 'IT', 'spain': 'ES', 'portugal': 'PT',
    'netherlands': 'NL', 'holland': 'NL',
    'switzerland': 'CH', 'sweden': 'SE', 'norway': 'NO',
    'denmark': 'DK', 'finland': 'FI', 'austria': 'AT',
    'belgium': 'BE', 'ireland': 'IE',
    'australia': 'AU', 'new zealand': 'NZ', 'canada': 'CA',
    'israel': 'IL', 'taiwan': 'TW', 'hong kong': 'HK',
    'romania': 'RO', 'hungary': 'HU', 'greece': 'GR',
    'serbia': 'RS', 'croatia': 'HR', 'bulgaria': 'BG',
    'belarus': 'BY', 'georgia': 'GE', 'azerbaijan': 'AZ',
    'morocco': 'MA', 'qatar': 'QA', 'kuwait': 'KW',
};

// ── 7. Store category → our vertical mapping ──────────────────────────────────
// Maps App Store primaryGenreName and Google Play category strings to our verticals

const STORE_TO_VERTICAL = {
    // App Store categories
    'games':                'gaming',
    'entertainment':        'entertainment',
    'social networking':    'social',
    'health & fitness':     'health',
    'medical':              'pharma',
    'utilities':            'utilities',
    'education':            'education',
    'shopping':             'ecommerce',
    'travel':               'travel',
    'food & drink':         'delivery',
    'finance':              'finance',
    'lifestyle':            'other',
    'productivity':         'utilities',
    'business':             'finance',
    'news':                 'entertainment',
    'sports':               'entertainment',
    'music':                'entertainment',
    'photo & video':        'entertainment',
    'photography':          'entertainment',
    'navigation':           'utilities',
    'weather':              'utilities',
    'reference':            'education',
    'books':                'education',
    'developer tools':      'utilities',
    'graphics & design':    'utilities',

    // Google Play categories (lowercase)
    'game':                         'gaming',
    'game_action':                  'gaming',
    'game_adventure':               'gaming',
    'game_arcade':                  'gaming',
    'game_board':                   'gaming',
    'game_card':                    'gaming',
    'game_casino':                  'gaming',
    'game_casual':                  'gaming',
    'game_educational':             'gaming',
    'game_music':                   'gaming',
    'game_puzzle':                  'gaming',
    'game_racing':                  'gaming',
    'game_role_playing':            'gaming',
    'game_simulation':              'gaming',
    'game_sports':                  'gaming',
    'game_strategy':                'gaming',
    'game_trivia':                  'gaming',
    'game_word':                    'gaming',
    'social':                       'social',
    'communication':                'social',
    'dating':                       'social',
    'health_and_fitness':           'health',
    'medical':                      'pharma',
    'tools':                        'utilities',
    'productivity':                 'utilities',
    'education':                    'education',
    'shopping':                     'ecommerce',
    'travel_and_local':             'travel',
    'maps_and_navigation':          'travel',
    'food_and_drink':               'delivery',
    'finance':                      'finance',
    'business':                     'finance',
    'entertainment':                'entertainment',
    'music_and_audio':              'entertainment',
    'video_players':                'entertainment',
    'news_and_magazines':           'entertainment',
    'sports':                       'entertainment',
    'photography':                  'entertainment',
    'weather':                      'utilities',
    'books_and_reference':          'education',
    'lifestyle':                    'other',
    'house_and_home':               'other',
    'beauty':                       'health',
    'parenting':                    'education',
    'auto_and_vehicles':            'other',
    'events':                       'entertainment',
    'art_and_design':               'utilities',
    'comics':                       'entertainment',
    'libraries_and_demo':           'utilities',
    'personalization':              'utilities',
};

// ── 8. Full country list (ISO 3166-1) ────────────────────────────────────────
// Used for GEO datalist dropdown. Sorted alphabetically by name.

const COUNTRIES = [
    { code: 'AF', name: 'Afghanistan' },
    { code: 'AL', name: 'Albania' },
    { code: 'DZ', name: 'Algeria' },
    { code: 'AD', name: 'Andorra' },
    { code: 'AO', name: 'Angola' },
    { code: 'AG', name: 'Antigua and Barbuda' },
    { code: 'AR', name: 'Argentina' },
    { code: 'AM', name: 'Armenia' },
    { code: 'AU', name: 'Australia' },
    { code: 'AT', name: 'Austria' },
    { code: 'AZ', name: 'Azerbaijan' },
    { code: 'BS', name: 'Bahamas' },
    { code: 'BH', name: 'Bahrain' },
    { code: 'BD', name: 'Bangladesh' },
    { code: 'BB', name: 'Barbados' },
    { code: 'BY', name: 'Belarus' },
    { code: 'BE', name: 'Belgium' },
    { code: 'BZ', name: 'Belize' },
    { code: 'BJ', name: 'Benin' },
    { code: 'BT', name: 'Bhutan' },
    { code: 'BO', name: 'Bolivia' },
    { code: 'BA', name: 'Bosnia and Herzegovina' },
    { code: 'BW', name: 'Botswana' },
    { code: 'BR', name: 'Brazil' },
    { code: 'BN', name: 'Brunei' },
    { code: 'BG', name: 'Bulgaria' },
    { code: 'BF', name: 'Burkina Faso' },
    { code: 'BI', name: 'Burundi' },
    { code: 'CV', name: 'Cabo Verde' },
    { code: 'KH', name: 'Cambodia' },
    { code: 'CM', name: 'Cameroon' },
    { code: 'CA', name: 'Canada' },
    { code: 'CF', name: 'Central African Republic' },
    { code: 'TD', name: 'Chad' },
    { code: 'CL', name: 'Chile' },
    { code: 'CN', name: 'China' },
    { code: 'CO', name: 'Colombia' },
    { code: 'KM', name: 'Comoros' },
    { code: 'CG', name: 'Congo' },
    { code: 'CD', name: 'Congo (DRC)' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'CI', name: "Cote d'Ivoire" },
    { code: 'HR', name: 'Croatia' },
    { code: 'CU', name: 'Cuba' },
    { code: 'CY', name: 'Cyprus' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'DK', name: 'Denmark' },
    { code: 'DJ', name: 'Djibouti' },
    { code: 'DM', name: 'Dominica' },
    { code: 'DO', name: 'Dominican Republic' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'EG', name: 'Egypt' },
    { code: 'SV', name: 'El Salvador' },
    { code: 'GQ', name: 'Equatorial Guinea' },
    { code: 'ER', name: 'Eritrea' },
    { code: 'EE', name: 'Estonia' },
    { code: 'SZ', name: 'Eswatini' },
    { code: 'ET', name: 'Ethiopia' },
    { code: 'FJ', name: 'Fiji' },
    { code: 'FI', name: 'Finland' },
    { code: 'FR', name: 'France' },
    { code: 'GA', name: 'Gabon' },
    { code: 'GM', name: 'Gambia' },
    { code: 'GE', name: 'Georgia' },
    { code: 'DE', name: 'Germany' },
    { code: 'GH', name: 'Ghana' },
    { code: 'GR', name: 'Greece' },
    { code: 'GD', name: 'Grenada' },
    { code: 'GT', name: 'Guatemala' },
    { code: 'GN', name: 'Guinea' },
    { code: 'GW', name: 'Guinea-Bissau' },
    { code: 'GY', name: 'Guyana' },
    { code: 'HT', name: 'Haiti' },
    { code: 'HN', name: 'Honduras' },
    { code: 'HK', name: 'Hong Kong' },
    { code: 'HU', name: 'Hungary' },
    { code: 'IS', name: 'Iceland' },
    { code: 'IN', name: 'India' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'IR', name: 'Iran' },
    { code: 'IQ', name: 'Iraq' },
    { code: 'IE', name: 'Ireland' },
    { code: 'IL', name: 'Israel' },
    { code: 'IT', name: 'Italy' },
    { code: 'JM', name: 'Jamaica' },
    { code: 'JP', name: 'Japan' },
    { code: 'JO', name: 'Jordan' },
    { code: 'KZ', name: 'Kazakhstan' },
    { code: 'KE', name: 'Kenya' },
    { code: 'KI', name: 'Kiribati' },
    { code: 'KP', name: 'Korea (North)' },
    { code: 'KR', name: 'Korea (South)' },
    { code: 'KW', name: 'Kuwait' },
    { code: 'KG', name: 'Kyrgyzstan' },
    { code: 'LA', name: 'Laos' },
    { code: 'LV', name: 'Latvia' },
    { code: 'LB', name: 'Lebanon' },
    { code: 'LS', name: 'Lesotho' },
    { code: 'LR', name: 'Liberia' },
    { code: 'LY', name: 'Libya' },
    { code: 'LI', name: 'Liechtenstein' },
    { code: 'LT', name: 'Lithuania' },
    { code: 'LU', name: 'Luxembourg' },
    { code: 'MO', name: 'Macao' },
    { code: 'MG', name: 'Madagascar' },
    { code: 'MW', name: 'Malawi' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'MV', name: 'Maldives' },
    { code: 'ML', name: 'Mali' },
    { code: 'MT', name: 'Malta' },
    { code: 'MR', name: 'Mauritania' },
    { code: 'MU', name: 'Mauritius' },
    { code: 'MX', name: 'Mexico' },
    { code: 'MD', name: 'Moldova' },
    { code: 'MC', name: 'Monaco' },
    { code: 'MN', name: 'Mongolia' },
    { code: 'ME', name: 'Montenegro' },
    { code: 'MA', name: 'Morocco' },
    { code: 'MZ', name: 'Mozambique' },
    { code: 'MM', name: 'Myanmar' },
    { code: 'NA', name: 'Namibia' },
    { code: 'NP', name: 'Nepal' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'NI', name: 'Nicaragua' },
    { code: 'NE', name: 'Niger' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'MK', name: 'North Macedonia' },
    { code: 'NO', name: 'Norway' },
    { code: 'OM', name: 'Oman' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'PA', name: 'Panama' },
    { code: 'PG', name: 'Papua New Guinea' },
    { code: 'PY', name: 'Paraguay' },
    { code: 'PE', name: 'Peru' },
    { code: 'PH', name: 'Philippines' },
    { code: 'PL', name: 'Poland' },
    { code: 'PT', name: 'Portugal' },
    { code: 'QA', name: 'Qatar' },
    { code: 'RO', name: 'Romania' },
    { code: 'RU', name: 'Russia' },
    { code: 'RW', name: 'Rwanda' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'SN', name: 'Senegal' },
    { code: 'RS', name: 'Serbia' },
    { code: 'SG', name: 'Singapore' },
    { code: 'SK', name: 'Slovakia' },
    { code: 'SI', name: 'Slovenia' },
    { code: 'SO', name: 'Somalia' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'SS', name: 'South Sudan' },
    { code: 'ES', name: 'Spain' },
    { code: 'LK', name: 'Sri Lanka' },
    { code: 'SD', name: 'Sudan' },
    { code: 'SR', name: 'Suriname' },
    { code: 'SE', name: 'Sweden' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'SY', name: 'Syria' },
    { code: 'TW', name: 'Taiwan' },
    { code: 'TJ', name: 'Tajikistan' },
    { code: 'TZ', name: 'Tanzania' },
    { code: 'TH', name: 'Thailand' },
    { code: 'TL', name: 'Timor-Leste' },
    { code: 'TG', name: 'Togo' },
    { code: 'TT', name: 'Trinidad and Tobago' },
    { code: 'TN', name: 'Tunisia' },
    { code: 'TR', name: 'Turkey' },
    { code: 'TM', name: 'Turkmenistan' },
    { code: 'UG', name: 'Uganda' },
    { code: 'UA', name: 'Ukraine' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'US', name: 'United States' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'UZ', name: 'Uzbekistan' },
    { code: 'VE', name: 'Venezuela' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'YE', name: 'Yemen' },
    { code: 'ZM', name: 'Zambia' },
    { code: 'ZW', name: 'Zimbabwe' },
];

// ── 9. Utility functions ───────────────────────────────────────────────────────

/**
 * Normalize a GEO input to a 2-letter ISO country code.
 * Accepts "RU", "Russia", "russia", etc.
 */
function normalizeGeoCode(raw) {
    if (!raw) return '';
    const cleaned = raw.trim().toLowerCase();
    if (!cleaned) return '';
    // If already a 2-letter code, return uppercased
    if (cleaned.length === 2) return cleaned.toUpperCase();
    // Check aliases
    if (GEO_ALIASES[cleaned]) return GEO_ALIASES[cleaned];
    // Fallback: uppercase first 2 chars (best guess)
    return cleaned.toUpperCase().slice(0, 2);
}

/**
 * Get the GEO tier for a country code. Unknown countries → tier3.
 * Empty GEO → tier1 (neutral, no penalty).
 */
function getGeoTier(geoCode) {
    if (!geoCode) return 'tier1'; // empty = neutral
    const code = geoCode.trim().toUpperCase();
    return COUNTRY_TO_TIER[code] || 'tier3';
}

/**
 * Map a store category string to our vertical key.
 */
function mapStoreCategory(category) {
    if (!category) return 'other';
    const key = category.toLowerCase().trim();
    return STORE_TO_VERTICAL[key] || 'other';
}

/**
 * Extract ISO 2-letter code from display value like "Russia (RU)" or plain "RU".
 */
function extractGeoCode(val) {
    if (!val) return '';
    const match = val.match(/\(([A-Z]{2})\)\s*$/);
    return match ? match[1] : normalizeGeoCode(val);
}

/**
 * Round to a sensible number of decimals for display.
 */
function roundBenchmark(val) {
    if (val >= 10) return Math.round(val * 10) / 10;   // e.g. 12.3
    if (val >= 1)  return Math.round(val * 100) / 100;  // e.g. 1.24
    return Math.round(val * 1000) / 1000;               // e.g. 0.168
}
