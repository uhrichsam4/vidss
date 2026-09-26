// Migration INTO the United States, Canada, Europe, Australia and New Zealand FROM the rest of the world, 1922–2100.
//
// One row = [destination set, origin place, first year, last year, people in millions].
// index.html turns every 0.1M (100,000 people) into one dot, spread evenly over the years.
//
// Only origins outside those five destinations are drawn. "Europe" follows the UN M49 regions, so Russia,
// Ukraine and the Balkans count as Europe (not drawn) while Turkey, Kazakhstan and the Caucasus count as Asia
// (drawn). US and Canada rows from Western origins stay in the table only so each decade can be calibrated
// to its official total; they are filtered out at the bottom of this file before anything is drawn.
//
// HISTORY (1922–2024) — rounded from:
//   US:     DHS Yearbook of Immigration Statistics, Table 2 (new permanent residents by region/country of
//           last residence, by decade). Mexico's 1990s IRCA legalizations are moved back to the 1980s,
//           when those people actually arrived. 2021–2024 uses Census Bureau net international migration
//           (Vintage 2024), which includes humanitarian and border arrivals.
//   Canada: Statistics Canada / IRCC permanent resident admissions by decade and source country.
//   Europe: EU-15/EU-27 + UK + Switzerland/Norway, people arriving from outside Western Europe
//           (including Eastern Europe). Eurostat, OECD International Migration Outlook, UN DESA migrant
//           stock, UK ONS; post-war expulsions and guest-worker figures from standard histories.
//           Europe figures are the least precise: treat them as order-of-magnitude.
//   Australia: ABS / Department of Home Affairs settler arrivals and permanent migration program by country of
//           birth (non-Western origins only; the White Australia policy kept these small until 1966–73).
//   NZ:     Stats NZ permanent and long-term arrivals / residence approvals by country (Pacific, Asia, Africa).
//
// PROJECTIONS (2025–2100) — medium/main scenarios, rounded, held flat for simplicity:
//   US ~0.9M/yr (US Census Bureau 2023 National Projections, main series)
//   Canada ~0.38M/yr (IRCC levels plan 2026–28, Statistics Canada medium scenario)
//   Europe ~1.2M/yr (Eurostat EUROPOP2023 baseline ~1M/yr for the EU + ONS ~0.3M/yr for the UK, minus
//   a margin for the long-run decline both assume)
//   Australia ~0.235M/yr (Treasury / ABS net overseas migration assumption), NZ ~0.03M/yr (Stats NZ median)
//   Origin shares for projections follow recent (2015–2024) patterns; the Western share of each rate is
//   dropped along with Western origins. That part is an assumption.
(() => {
  // name: [lon, lat, country name in world.js, pick radius in degrees]
  const P = {
    // destinations — United States
    NYC: [-74.0, 40.7, 'United States of America', 2.2], CHI: [-87.6, 41.9, 'United States of America', 2],
    BOS: [-71.1, 42.4, 'United States of America', 1.6], DET: [-83.0, 42.3, 'United States of America', 1.6],
    PHL: [-75.2, 40.0, 'United States of America', 1.5], CLE: [-81.7, 41.5, 'United States of America', 1.4],
    PIT: [-80.0, 40.4, 'United States of America', 1.4], SF: [-122.4, 37.8, 'United States of America', 1.8],
    LA: [-118.2, 34.1, 'United States of America', 2.2], HOU: [-95.4, 29.8, 'United States of America', 2],
    DAL: [-96.8, 32.8, 'United States of America', 1.8], PHX: [-112.1, 33.4, 'United States of America', 1.8],
    SAT: [-98.5, 29.4, 'United States of America', 1.6], SD: [-117.2, 32.8, 'United States of America', 1.3],
    DEN: [-105.0, 39.7, 'United States of America', 1.6], MIA: [-80.2, 25.8, 'United States of America', 1.6],
    ORL: [-81.4, 28.5, 'United States of America', 1.4], SEA: [-122.3, 47.6, 'United States of America', 1.6],
    DC: [-77.0, 38.9, 'United States of America', 1.6], ATL: [-84.4, 33.7, 'United States of America', 1.6],
    MSP: [-93.3, 45.0, 'United States of America', 1.5],
    // destinations — Canada
    TOR: [-79.4, 43.7, 'Canada', 1.6], MTL: [-73.6, 45.5, 'Canada', 1.5], VAN: [-123.1, 49.3, 'Canada', 1.4],
    CAL: [-114.1, 51.0, 'Canada', 1.4], EDM: [-113.5, 53.5, 'Canada', 1.4], OTT: [-75.7, 45.4, 'Canada', 1.2],
    WPG: [-97.1, 49.9, 'Canada', 1.6], REG: [-104.6, 50.4, 'Canada', 2.2],
    // destinations — Australia, New Zealand
    SYD: [151.2, -33.9, 'Australia', 1.6], MEL: [145.0, -37.8, 'Australia', 1.6], BNE: [153.0, -27.5, 'Australia', 1.5],
    PER: [115.9, -31.9, 'Australia', 1.5], ADL: [138.6, -34.9, 'Australia', 1.3], AKL: [174.8, -36.9, 'New Zealand', 1.2],
    WLG: [174.8, -41.3, 'New Zealand', 0.8], CHC: [172.6, -43.5, 'New Zealand', 1],
    // destinations — Europe
    BER: [13.4, 52.5, 'Germany', 1.6], FRA: [8.7, 50.1, 'Germany', 1.5], MUC: [11.6, 48.1, 'Germany', 1.4],
    HAM: [10.0, 53.6, 'Germany', 1.3], RUH: [7.0, 51.4, 'Germany', 1.3], STR: [9.2, 48.8, 'Germany', 1.3],
    PAR: [2.35, 48.9, 'France', 1.6], LYO: [4.8, 45.8, 'France', 1.3], MRS: [5.4, 43.3, 'France', 1.2],
    LON: [-0.1, 51.5, 'United Kingdom', 1.4], BHX: [-1.9, 52.5, 'United Kingdom', 1.2], MAN: [-2.2, 53.5, 'United Kingdom', 1.2],
    MAD: [-3.7, 40.4, 'Spain', 1.6], BCN: [2.2, 41.4, 'Spain', 1.3], ROM: [12.5, 41.9, 'Italy', 1.4],
    MIL: [9.2, 45.5, 'Italy', 1.4], AMS: [4.9, 52.4, 'Netherlands', 1.2], BRU: [4.4, 50.8, 'Belgium', 1],
    STO: [18.1, 59.3, 'Sweden', 1.8], VIE: [16.4, 48.2, 'Austria', 1.3], ZRH: [8.5, 47.4, 'Switzerland', 1],
    WAW: [21.0, 52.2, 'Poland', 1.8], KRK: [19.9, 50.1, 'Poland', 1.3], PRG: [14.4, 50.1, 'Czechia', 1.3],
    DUB: [-6.3, 53.3, 'Ireland', 1.2], LIS: [-9.1, 38.7, 'Portugal', 1.2],
    // origins
    ITA: [14.3, 40.9, 'Italy', 3], DEU: [10.0, 51.0, 'Germany', 3], GBR: [-2.0, 53.0, 'United Kingdom', 2.5],
    IRL: [-8.0, 53.2, 'Ireland', 1.5], POL: [20.0, 51.5, 'Poland', 3], SWE: [15.0, 60.0, 'Sweden', 4],
    GRC: [22.5, 39.5, 'Greece', 2], PRT: [-8.2, 40.0, 'Portugal', 2], ESP: [-4.0, 40.0, 'Spain', 3],
    NLD: [5.3, 52.2, 'Netherlands', 1.2], HUN: [19.0, 47.2, 'Hungary', 1.5], YUG: [19.0, 44.0, 'Serbia', 3],
    UKR: [31.0, 49.0, 'Ukraine', 5], RUS: [40.0, 55.0, 'Russia', 7], KAZ: [70.0, 50.0, 'Kazakhstan', 7],
    ROU: [25.0, 45.8, 'Romania', 3], BGR: [25.3, 42.7, 'Bulgaria', 2], SIL: [18.0, 51.0, 'Poland', 2.5],
    CZE: [15.5, 49.9, 'Czechia', 2], TUR: [33.0, 39.0, 'Turkey', 6], CAN: [-79.0, 45.0, 'Canada', 5],
    USA: [-85.0, 40.0, 'United States of America', 9], MEX: [-101.0, 22.0, 'Mexico', 7],
    CUB: [-79.0, 22.0, 'Cuba', 3], DOM: [-70.5, 18.8, 'Dominican Rep.', 1.2], HTI: [-72.5, 18.9, 'Haiti', 1],
    JAM: [-77.3, 18.1, 'Jamaica', 1], TTO: [-61.3, 10.5, 'Trinidad and Tobago', 0.5],
    SLV: [-89.0, 13.7, 'El Salvador', 0.8], GTM: [-90.5, 15.2, 'Guatemala', 1.5], HND: [-86.8, 14.8, 'Honduras', 1.5],
    NIC: [-85.2, 12.8, 'Nicaragua', 1.5], COL: [-74.2, 4.6, 'Colombia', 4], ECU: [-78.5, -1.5, 'Ecuador', 2],
    VEN: [-66.5, 8.0, 'Venezuela', 4], PER: [-75.5, -10.0, 'Peru', 4], BRA: [-46.6, -18.0, 'Brazil', 9],
    ARG: [-62.0, -34.0, 'Argentina', 5], BOL: [-65.0, -17.0, 'Bolivia', 3], CHL: [-71.0, -33.5, 'Chile', 3],
    SUR: [-55.5, 4.5, 'Suriname', 2], MAR: [-6.5, 33.0, 'Morocco', 3], DZA: [3.0, 35.0, 'Algeria', 4],
    TUN: [9.8, 35.5, 'Tunisia', 2], EGY: [31.2, 29.0, 'Egypt', 3], NGA: [7.5, 8.5, 'Nigeria', 4],
    GHA: [-1.2, 7.0, 'Ghana', 2], SEN: [-15.5, 14.5, 'Senegal', 2], ETH: [39.0, 9.0, 'Ethiopia', 4],
    ERI: [38.9, 15.3, 'Eritrea', 1.5], SOM: [45.3, 4.0, 'Somalia', 3], COD: [23.0, -3.0, 'Dem. Rep. Congo', 6],
    ZWE: [30.0, -19.0, 'Zimbabwe', 2.5], KEN: [37.5, 0.0, 'Kenya', 3], SYR: [37.5, 35.0, 'Syria', 2],
    IRQ: [44.0, 33.0, 'Iraq', 3], IRN: [52.0, 33.0, 'Iran', 5], AFG: [66.0, 34.0, 'Afghanistan', 4],
    PAK: [71.0, 30.0, 'Pakistan', 4], IND: [79.0, 22.0, 'India', 8], BGD: [90.3, 23.8, 'Bangladesh', 2],
    LKA: [80.7, 7.8, 'Sri Lanka', 1], NPL: [84.0, 28.2, 'Nepal', 2], CHN: [113.0, 31.0, 'China', 9],
    HKG: [114.2, 22.3, 'Hong Kong', 0.4], TWN: [121.0, 23.7, 'Taiwan', 1], KOR: [127.8, 36.5, 'South Korea', 1.5],
    JPN: [138.0, 36.0, 'Japan', 3], PHL: [121.5, 14.5, 'Philippines', 3], VNM: [106.0, 16.0, 'Vietnam', 3],
    LAO: [102.5, 19.0, 'Laos', 2], KHM: [104.9, 12.5, 'Cambodia', 1.5], MMR: [96.0, 20.0, 'Myanmar', 3],
    IDN: [110.0, -7.3, 'Indonesia', 4], LBN: [35.5, 33.9, 'Lebanon', 0.4], FRA_O: [2.35, 47.0, 'France', 3],
    CMR: [12.0, 5.5, 'Cameroon', 3], MYS: [101.7, 3.5, 'Malaysia', 2], ZAF: [27.5, -27.0, 'South Africa', 4],
    SDN: [32.5, 15.0, 'Sudan', 3], FJI: [178.0, -17.8, 'Fiji', 1], WSM: [-172.1, -13.8, 'Samoa', 0.5],
    TON: [-175.2, -21.2, 'Tonga', 0.4], COK: [-159.8, -21.2, 'Cook Is.', 0.3],
  };

  // destination sets: weighted cities
  const D = {
    US_EARLY: {NYC: 35, CHI: 15, BOS: 10, DET: 10, PHL: 10, CLE: 5, PIT: 5, SF: 5, LA: 5},
    US_MEX: {LA: 30, HOU: 15, CHI: 12, DAL: 12, PHX: 10, SAT: 10, SD: 6, DEN: 5},
    US_CARIB: {MIA: 45, NYC: 40, ORL: 10, BOS: 5},
    US_ASIA: {LA: 25, SF: 20, NYC: 20, SEA: 10, HOU: 8, CHI: 7, DAL: 5, DC: 5},
    US_CENTAM: {LA: 30, HOU: 20, DC: 15, NYC: 15, MIA: 10, DAL: 10},
    US_SOUTHAM: {MIA: 30, NYC: 30, HOU: 10, LA: 10, DC: 10, BOS: 10},
    US_AFRICA: {NYC: 20, DC: 25, HOU: 15, MSP: 10, ATL: 15, DAL: 15},
    US_EUROPE: {NYC: 35, CHI: 15, BOS: 10, LA: 10, SF: 5, DC: 5, PHL: 10, DET: 5, SEA: 5},
    US_CANADA: {DET: 20, BOS: 20, NYC: 20, SEA: 10, LA: 15, CHI: 15},
    US_MIX: {NYC: 20, LA: 20, MIA: 10, HOU: 10, CHI: 10, SF: 8, DAL: 8, DC: 7, SEA: 7},
    CA_EARLY: {TOR: 30, MTL: 30, WPG: 15, VAN: 10, REG: 15},
    CA_MODERN: {TOR: 45, VAN: 20, MTL: 15, CAL: 10, EDM: 5, OTT: 5},
    EU_DE: {BER: 20, FRA: 20, MUC: 20, HAM: 10, RUH: 20, STR: 10},
    EU_FR: {PAR: 65, LYO: 20, MRS: 15},
    EU_UK: {LON: 65, BHX: 20, MAN: 15},
    EU_NL: {AMS: 80, BRU: 20},
    EU_WEST_1920S: {PAR: 50, LYO: 20, MRS: 20, BRU: 10},
    EU_SOUTH_NORTH: {RUH: 15, STR: 15, MUC: 10, FRA: 10, PAR: 25, LYO: 5, ZRH: 15, BRU: 5},
    EU_MAGHREB: {PAR: 40, MRS: 15, LYO: 5, BRU: 10, AMS: 10, MAD: 8, BCN: 7, MIL: 5},
    EU_LATAM: {MAD: 45, BCN: 30, MIL: 10, ROM: 5, LON: 5, LIS: 5},
    EU_EAST_INTRA: {LON: 25, MAN: 5, BHX: 5, BER: 10, MUC: 10, RUH: 10, MIL: 10, ROM: 10, MAD: 10, DUB: 5},
    EU_ASYLUM: {BER: 15, RUH: 15, FRA: 10, MUC: 10, HAM: 5, STO: 12, VIE: 8, PAR: 10, MIL: 8, AMS: 7},
    EU_UKR: {WAW: 18, KRK: 12, BER: 15, MUC: 8, RUH: 7, PRG: 12, MIL: 5, MAD: 5, LON: 5, PAR: 3, VIE: 5, AMS: 5},
    EU_MIX: {BER: 10, RUH: 8, MUC: 7, LON: 14, BHX: 3, MAN: 3, PAR: 12, MAD: 9, BCN: 6, MIL: 7, ROM: 5, AMS: 5, BRU: 4, STO: 4, VIE: 3},
    EU_UK_MIX: {LON: 60, BHX: 20, MAN: 20},
    AU_MIX: {SYD: 40, MEL: 35, BNE: 10, PER: 10, ADL: 5},
    NZ_MIX: {AKL: 70, WLG: 15, CHC: 15},
  };

  // origins that are themselves destinations (US, Canada, Europe incl. Russia/Ukraine, Australia, NZ): not drawn
  const WESTERN = new Set(['ITA', 'DEU', 'GBR', 'IRL', 'POL', 'SWE', 'GRC', 'PRT', 'ESP', 'NLD', 'HUN', 'YUG', 'UKR',
    'RUS', 'ROU', 'BGR', 'SIL', 'CZE', 'CAN', 'USA', 'FRA_O']);

  // [dest set, origin, from, to, millions]
  const F = [
    // ---------------- United States ----------------
    // 1920s: Europe + Canada + Mexico; the 1924 Act cut southern/eastern European quotas
    ['US_EARLY', 'ITA', 1922, 1930, 0.45], ['US_EARLY', 'DEU', 1922, 1930, 0.42], ['US_EARLY', 'GBR', 1922, 1930, 0.3],
    ['US_EARLY', 'IRL', 1922, 1930, 0.2], ['US_EARLY', 'POL', 1922, 1930, 0.2], ['US_EARLY', 'SWE', 1922, 1930, 0.15],
    ['US_EARLY', 'GRC', 1922, 1930, 0.2], ['US_CANADA', 'CAN', 1922, 1930, 0.8], ['US_MEX', 'MEX', 1922, 1930, 0.45],
    ['US_CARIB', 'CUB', 1922, 1930, 0.04], ['US_CARIB', 'JAM', 1922, 1930, 0.03], ['US_ASIA', 'JPN', 1922, 1924, 0.03],
    ['US_ASIA', 'CHN', 1922, 1930, 0.03], ['US_EUROPE', 'TUR', 1922, 1930, 0.03], ['US_SOUTHAM', 'COL', 1922, 1930, 0.03],
    ['US_SOUTHAM', 'BRA', 1922, 1930, 0.02], ['US_CENTAM', 'GTM', 1922, 1930, 0.02],
    ['US_CARIB', 'CUB', 1931, 1940, 0.01], ['US_CARIB', 'JAM', 1931, 1940, 0.01], ['US_ASIA', 'CHN', 1931, 1940, 0.01],
    // 1930s: Depression, refugees from Nazi Germany
    ['US_EARLY', 'DEU', 1931, 1940, 0.2], ['US_EARLY', 'ITA', 1931, 1940, 0.1], ['US_EARLY', 'POL', 1931, 1940, 0.12],
    ['US_EARLY', 'GBR', 1931, 1940, 0.05], ['US_CANADA', 'CAN', 1931, 1940, 0.15], ['US_MEX', 'MEX', 1931, 1940, 0.03],
    ['US_EARLY', 'HUN', 1931, 1940, 0.05],
    // 1940s: war brides, displaced persons
    ['US_EARLY', 'GBR', 1941, 1950, 0.14], ['US_EARLY', 'DEU', 1941, 1950, 0.23], ['US_EARLY', 'ITA', 1941, 1950, 0.06],
    ['US_EARLY', 'POL', 1941, 1950, 0.07], ['US_EARLY', 'HUN', 1941, 1950, 0.08], ['US_CANADA', 'CAN', 1941, 1950, 0.17],
    ['US_MEX', 'MEX', 1941, 1950, 0.06], ['US_CARIB', 'CUB', 1941, 1950, 0.05],
    // 1950s
    ['US_EUROPE', 'DEU', 1951, 1960, 0.48], ['US_EUROPE', 'GBR', 1951, 1960, 0.2], ['US_EUROPE', 'ITA', 1951, 1960, 0.19],
    ['US_EUROPE', 'IRL', 1951, 1960, 0.05], ['US_EUROPE', 'POL', 1951, 1960, 0.1], ['US_EUROPE', 'GRC', 1951, 1960, 0.1],
    ['US_EUROPE', 'HUN', 1951, 1960, 0.1], ['US_EUROPE', 'NLD', 1951, 1960, 0.08], ['US_EUROPE', 'PRT', 1951, 1960, 0.1],
    ['US_CANADA', 'CAN', 1951, 1960, 0.35], ['US_MEX', 'MEX', 1951, 1960, 0.27], ['US_CARIB', 'CUB', 1951, 1960, 0.12],
    ['US_ASIA', 'CHN', 1951, 1960, 0.05], ['US_ASIA', 'JPN', 1951, 1960, 0.05], ['US_ASIA', 'PHL', 1951, 1960, 0.05],
    ['US_SOUTHAM', 'COL', 1951, 1960, 0.09],
    // 1960s: 1965 Act ends national-origin quotas; Cuban exodus
    ['US_EUROPE', 'GBR', 1961, 1970, 0.2], ['US_EUROPE', 'DEU', 1961, 1970, 0.2], ['US_EUROPE', 'ITA', 1961, 1970, 0.21],
    ['US_EUROPE', 'GRC', 1961, 1970, 0.09], ['US_EUROPE', 'POL', 1961, 1970, 0.07], ['US_EUROPE', 'PRT', 1961, 1970, 0.08],
    ['US_EUROPE', 'IRL', 1961, 1970, 0.03], ['US_EUROPE', 'YUG', 1961, 1970, 0.1], ['US_EUROPE', 'ESP', 1961, 1970, 0.05],
    ['US_EUROPE', 'NLD', 1961, 1970, 0.1],
    ['US_CANADA', 'CAN', 1961, 1970, 0.41], ['US_MEX', 'MEX', 1961, 1970, 0.44], ['US_CARIB', 'CUB', 1961, 1970, 0.25],
    ['US_CARIB', 'DOM', 1961, 1970, 0.09], ['US_CARIB', 'JAM', 1961, 1970, 0.07], ['US_CARIB', 'HTI', 1961, 1970, 0.03],
    ['US_ASIA', 'PHL', 1961, 1970, 0.1], ['US_ASIA', 'CHN', 1961, 1970, 0.1], ['US_ASIA', 'IND', 1961, 1970, 0.03],
    ['US_ASIA', 'KOR', 1961, 1970, 0.03], ['US_ASIA', 'JPN', 1961, 1970, 0.04], ['US_ASIA', 'HKG', 1961, 1970, 0.06],
    ['US_SOUTHAM', 'COL', 1961, 1970, 0.07], ['US_SOUTHAM', 'ECU', 1961, 1970, 0.04], ['US_SOUTHAM', 'ARG', 1961, 1970, 0.05],
    ['US_SOUTHAM', 'PER', 1961, 1970, 0.07], ['US_CENTAM', 'GTM', 1961, 1970, 0.05], ['US_CENTAM', 'SLV', 1961, 1970, 0.05],
    // 1970s: Asia rises, Vietnam refugees
    ['US_EUROPE', 'GBR', 1971, 1980, 0.14], ['US_EUROPE', 'ITA', 1971, 1980, 0.13], ['US_EUROPE', 'DEU', 1971, 1980, 0.07],
    ['US_EUROPE', 'GRC', 1971, 1980, 0.09], ['US_EUROPE', 'PRT', 1971, 1980, 0.1], ['US_EUROPE', 'POL', 1971, 1980, 0.05],
    ['US_EUROPE', 'YUG', 1971, 1980, 0.05], ['US_EUROPE', 'RUS', 1971, 1980, 0.17],
    ['US_ASIA', 'PHL', 1971, 1980, 0.35], ['US_ASIA', 'KOR', 1971, 1980, 0.27], ['US_ASIA', 'CHN', 1971, 1980, 0.2],
    ['US_ASIA', 'IND', 1971, 1980, 0.16], ['US_ASIA', 'VNM', 1971, 1980, 0.17], ['US_ASIA', 'HKG', 1971, 1980, 0.05],
    ['US_ASIA', 'TWN', 1971, 1980, 0.05], ['US_ASIA', 'JPN', 1971, 1980, 0.05], ['US_ASIA', 'IRN', 1971, 1980, 0.05],
    ['US_ASIA', 'PAK', 1971, 1980, 0.03], ['US_ASIA', 'LAO', 1971, 1980, 0.03],
    ['US_MEX', 'MEX', 1971, 1980, 0.62], ['US_CARIB', 'CUB', 1971, 1980, 0.26], ['US_CARIB', 'DOM', 1971, 1980, 0.15],
    ['US_CARIB', 'JAM', 1971, 1980, 0.14], ['US_CARIB', 'HTI', 1971, 1980, 0.06], ['US_CARIB', 'TTO', 1971, 1980, 0.06],
    ['US_CENTAM', 'SLV', 1971, 1980, 0.04], ['US_CENTAM', 'GTM', 1971, 1980, 0.04], ['US_CENTAM', 'HND', 1971, 1980, 0.02],
    ['US_CENTAM', 'NIC', 1971, 1980, 0.03], ['US_SOUTHAM', 'COL', 1971, 1980, 0.08], ['US_SOUTHAM', 'ECU', 1971, 1980, 0.05],
    ['US_SOUTHAM', 'ARG', 1971, 1980, 0.03], ['US_SOUTHAM', 'PER', 1971, 1980, 0.03], ['US_SOUTHAM', 'BRA', 1971, 1980, 0.03],
    ['US_SOUTHAM', 'CHL', 1971, 1980, 0.02], ['US_SOUTHAM', 'VEN', 1971, 1980, 0.04],
    ['US_CANADA', 'CAN', 1971, 1980, 0.17], ['US_AFRICA', 'NGA', 1971, 1980, 0.03], ['US_AFRICA', 'EGY', 1971, 1980, 0.03],
    ['US_AFRICA', 'ETH', 1971, 1980, 0.02],
    // 1980s (Mexico includes people legalized by IRCA in the 1990s, placed at arrival)
    ['US_ASIA', 'PHL', 1981, 1990, 0.5], ['US_ASIA', 'CHN', 1981, 1990, 0.35], ['US_ASIA', 'KOR', 1981, 1990, 0.33],
    ['US_ASIA', 'VNM', 1981, 1990, 0.28], ['US_ASIA', 'IND', 1981, 1990, 0.26], ['US_ASIA', 'LAO', 1981, 1990, 0.15],
    ['US_ASIA', 'KHM', 1981, 1990, 0.12], ['US_ASIA', 'IRN', 1981, 1990, 0.1], ['US_ASIA', 'HKG', 1981, 1990, 0.07],
    ['US_ASIA', 'TWN', 1981, 1990, 0.08], ['US_ASIA', 'PAK', 1981, 1990, 0.06], ['US_ASIA', 'JPN', 1981, 1990, 0.05],
    ['US_MEX', 'MEX', 1981, 1990, 1.5], ['US_CARIB', 'DOM', 1981, 1990, 0.25], ['US_CARIB', 'CUB', 1981, 1990, 0.14],
    ['US_CARIB', 'JAM', 1981, 1990, 0.21], ['US_CARIB', 'HTI', 1981, 1990, 0.14], ['US_CARIB', 'TTO', 1981, 1990, 0.05],
    ['US_CENTAM', 'SLV', 1981, 1990, 0.14], ['US_CENTAM', 'GTM', 1981, 1990, 0.09], ['US_CENTAM', 'HND', 1981, 1990, 0.05],
    ['US_CENTAM', 'NIC', 1981, 1990, 0.06], ['US_SOUTHAM', 'COL', 1981, 1990, 0.12], ['US_SOUTHAM', 'ECU', 1981, 1990, 0.06],
    ['US_SOUTHAM', 'PER', 1981, 1990, 0.07], ['US_SOUTHAM', 'BRA', 1981, 1990, 0.04], ['US_SOUTHAM', 'ARG', 1981, 1990, 0.04],
    ['US_SOUTHAM', 'VEN', 1981, 1990, 0.03], ['US_SOUTHAM', 'CHL', 1981, 1990, 0.04],
    ['US_EUROPE', 'GBR', 1981, 1990, 0.15], ['US_EUROPE', 'POL', 1981, 1990, 0.1], ['US_EUROPE', 'DEU', 1981, 1990, 0.07],
    ['US_EUROPE', 'RUS', 1981, 1990, 0.1], ['US_EUROPE', 'ITA', 1981, 1990, 0.06], ['US_EUROPE', 'IRL', 1981, 1990, 0.05],
    ['US_EUROPE', 'PRT', 1981, 1990, 0.04], ['US_EUROPE', 'GRC', 1981, 1990, 0.04], ['US_EUROPE', 'YUG', 1981, 1990, 0.06],
    ['US_AFRICA', 'NGA', 1981, 1990, 0.04], ['US_AFRICA', 'ETH', 1981, 1990, 0.04], ['US_AFRICA', 'EGY', 1981, 1990, 0.03],
    ['US_AFRICA', 'GHA', 1981, 1990, 0.03], ['US_CANADA', 'CAN', 1981, 1990, 0.16],
    // 1990s: end of the Cold War
    ['US_ASIA', 'CHN', 1991, 2000, 0.42], ['US_ASIA', 'PHL', 1991, 2000, 0.5], ['US_ASIA', 'IND', 1991, 2000, 0.36],
    ['US_ASIA', 'VNM', 1991, 2000, 0.42], ['US_ASIA', 'KOR', 1991, 2000, 0.17], ['US_ASIA', 'PAK', 1991, 2000, 0.12],
    ['US_ASIA', 'BGD', 1991, 2000, 0.07], ['US_ASIA', 'IRN', 1991, 2000, 0.12], ['US_ASIA', 'TWN', 1991, 2000, 0.11],
    ['US_ASIA', 'HKG', 1991, 2000, 0.1], ['US_ASIA', 'JPN', 1991, 2000, 0.07], ['US_ASIA', 'LAO', 1991, 2000, 0.05],
    ['US_ASIA', 'KHM', 1991, 2000, 0.04], ['US_ASIA', 'IRQ', 1991, 2000, 0.05], ['US_ASIA', 'LBN', 1991, 2000, 0.04],
    ['US_MEX', 'MEX', 1991, 2000, 2.2], ['US_CARIB', 'DOM', 1991, 2000, 0.36], ['US_CARIB', 'CUB', 1991, 2000, 0.17],
    ['US_CARIB', 'JAM', 1991, 2000, 0.17], ['US_CARIB', 'HTI', 1991, 2000, 0.18], ['US_CARIB', 'TTO', 1991, 2000, 0.06],
    ['US_CENTAM', 'SLV', 1991, 2000, 0.27], ['US_CENTAM', 'GTM', 1991, 2000, 0.13], ['US_CENTAM', 'HND', 1991, 2000, 0.07],
    ['US_CENTAM', 'NIC', 1991, 2000, 0.1], ['US_SOUTHAM', 'COL', 1991, 2000, 0.13], ['US_SOUTHAM', 'ECU', 1991, 2000, 0.08],
    ['US_SOUTHAM', 'PER', 1991, 2000, 0.11], ['US_SOUTHAM', 'BRA', 1991, 2000, 0.06], ['US_SOUTHAM', 'ARG', 1991, 2000, 0.04],
    ['US_SOUTHAM', 'VEN', 1991, 2000, 0.05], ['US_SOUTHAM', 'CHL', 1991, 2000, 0.02], ['US_SOUTHAM', 'BOL', 1991, 2000, 0.02],
    ['US_EUROPE', 'RUS', 1991, 2000, 0.28], ['US_EUROPE', 'UKR', 1991, 2000, 0.18], ['US_EUROPE', 'POL', 1991, 2000, 0.17],
    ['US_EUROPE', 'GBR', 1991, 2000, 0.15], ['US_EUROPE', 'IRL', 1991, 2000, 0.06], ['US_EUROPE', 'DEU', 1991, 2000, 0.09],
    ['US_EUROPE', 'YUG', 1991, 2000, 0.2], ['US_EUROPE', 'ROU', 1991, 2000, 0.06], ['US_EUROPE', 'ITA', 1991, 2000, 0.06],
    ['US_EUROPE', 'KAZ', 1991, 2000, 0.03], ['US_EUROPE', 'GRC', 1991, 2000, 0.03], ['US_EUROPE', 'BGR', 1991, 2000, 0.04],
    ['US_AFRICA', 'NGA', 1991, 2000, 0.07], ['US_AFRICA', 'ETH', 1991, 2000, 0.05], ['US_AFRICA', 'EGY', 1991, 2000, 0.05],
    ['US_AFRICA', 'GHA', 1991, 2000, 0.04], ['US_AFRICA', 'SOM', 1991, 2000, 0.04], ['US_AFRICA', 'KEN', 1991, 2000, 0.03],
    ['US_AFRICA', 'SEN', 1991, 2000, 0.02], ['US_AFRICA', 'COD', 1991, 2000, 0.02], ['US_AFRICA', 'ERI', 1991, 2000, 0.03],
    ['US_CANADA', 'CAN', 1991, 2000, 0.19],
    // 2000s
    ['US_ASIA', 'IND', 2001, 2010, 0.6], ['US_ASIA', 'CHN', 2001, 2010, 0.68], ['US_ASIA', 'PHL', 2001, 2010, 0.55],
    ['US_ASIA', 'VNM', 2001, 2010, 0.29], ['US_ASIA', 'KOR', 2001, 2010, 0.21], ['US_ASIA', 'PAK', 2001, 2010, 0.15],
    ['US_ASIA', 'BGD', 2001, 2010, 0.1], ['US_ASIA', 'IRN', 2001, 2010, 0.12], ['US_ASIA', 'TWN', 2001, 2010, 0.09],
    ['US_ASIA', 'JPN', 2001, 2010, 0.08], ['US_ASIA', 'IRQ', 2001, 2010, 0.08], ['US_ASIA', 'HKG', 2001, 2010, 0.06],
    ['US_ASIA', 'NPL', 2001, 2010, 0.04], ['US_ASIA', 'MMR', 2001, 2010, 0.06], ['US_ASIA', 'AFG', 2001, 2010, 0.03],
    ['US_ASIA', 'LBN', 2001, 2010, 0.04], ['US_ASIA', 'KHM', 2001, 2010, 0.03],
    ['US_MEX', 'MEX', 2001, 2010, 1.7], ['US_CARIB', 'CUB', 2001, 2010, 0.27], ['US_CARIB', 'DOM', 2001, 2010, 0.29],
    ['US_CARIB', 'HTI', 2001, 2010, 0.2], ['US_CARIB', 'JAM', 2001, 2010, 0.17], ['US_CARIB', 'TTO', 2001, 2010, 0.06],
    ['US_CENTAM', 'SLV', 2001, 2010, 0.25], ['US_CENTAM', 'GTM', 2001, 2010, 0.16], ['US_CENTAM', 'HND', 2001, 2010, 0.07],
    ['US_CENTAM', 'NIC', 2001, 2010, 0.1], ['US_SOUTHAM', 'COL', 2001, 2010, 0.24], ['US_SOUTHAM', 'ECU', 2001, 2010, 0.11],
    ['US_SOUTHAM', 'PER', 2001, 2010, 0.13], ['US_SOUTHAM', 'BRA', 2001, 2010, 0.12], ['US_SOUTHAM', 'VEN', 2001, 2010, 0.08],
    ['US_SOUTHAM', 'ARG', 2001, 2010, 0.07], ['US_SOUTHAM', 'BOL', 2001, 2010, 0.04], ['US_SOUTHAM', 'CHL', 2001, 2010, 0.03],
    ['US_SOUTHAM', 'SUR', 2001, 2010, 0.04],
    ['US_EUROPE', 'UKR', 2001, 2010, 0.18], ['US_EUROPE', 'RUS', 2001, 2010, 0.15], ['US_EUROPE', 'POL', 2001, 2010, 0.12],
    ['US_EUROPE', 'GBR', 2001, 2010, 0.18], ['US_EUROPE', 'DEU', 2001, 2010, 0.1], ['US_EUROPE', 'YUG', 2001, 2010, 0.18],
    ['US_EUROPE', 'ROU', 2001, 2010, 0.06], ['US_EUROPE', 'IRL', 2001, 2010, 0.03], ['US_EUROPE', 'ITA', 2001, 2010, 0.04],
    ['US_EUROPE', 'KAZ', 2001, 2010, 0.04], ['US_EUROPE', 'BGR', 2001, 2010, 0.05], ['US_EUROPE', 'TUR', 2001, 2010, 0.04],
    ['US_EUROPE', 'HUN', 2001, 2010, 0.02], ['US_EUROPE', 'NLD', 2001, 2010, 0.02], ['US_EUROPE', 'SWE', 2001, 2010, 0.02],
    ['US_EUROPE', 'ESP', 2001, 2010, 0.02], ['US_EUROPE', 'GRC', 2001, 2010, 0.02], ['US_EUROPE', 'PRT', 2001, 2010, 0.02],
    ['US_AFRICA', 'NGA', 2001, 2010, 0.1], ['US_AFRICA', 'ETH', 2001, 2010, 0.1], ['US_AFRICA', 'EGY', 2001, 2010, 0.08],
    ['US_AFRICA', 'GHA', 2001, 2010, 0.08], ['US_AFRICA', 'SOM', 2001, 2010, 0.08], ['US_AFRICA', 'KEN', 2001, 2010, 0.08],
    ['US_AFRICA', 'SEN', 2001, 2010, 0.04], ['US_AFRICA', 'COD', 2001, 2010, 0.05], ['US_AFRICA', 'MAR', 2001, 2010, 0.05],
    ['US_AFRICA', 'ERI', 2001, 2010, 0.05], ['US_AFRICA', 'ZWE', 2001, 2010, 0.05],
    ['US_CANADA', 'CAN', 2001, 2010, 0.24],
    // 2010s
    ['US_ASIA', 'IND', 2011, 2020, 0.64], ['US_ASIA', 'CHN', 2011, 2020, 0.72], ['US_ASIA', 'PHL', 2011, 2020, 0.52],
    ['US_ASIA', 'VNM', 2011, 2020, 0.3], ['US_ASIA', 'KOR', 2011, 2020, 0.2], ['US_ASIA', 'PAK', 2011, 2020, 0.17],
    ['US_ASIA', 'BGD', 2011, 2020, 0.15], ['US_ASIA', 'IRN', 2011, 2020, 0.13], ['US_ASIA', 'IRQ', 2011, 2020, 0.15],
    ['US_ASIA', 'AFG', 2011, 2020, 0.1], ['US_ASIA', 'NPL', 2011, 2020, 0.12], ['US_ASIA', 'MMR', 2011, 2020, 0.12],
    ['US_ASIA', 'TWN', 2011, 2020, 0.07], ['US_ASIA', 'JPN', 2011, 2020, 0.06], ['US_ASIA', 'HKG', 2011, 2020, 0.04],
    ['US_ASIA', 'SYR', 2011, 2020, 0.04], ['US_ASIA', 'LBN', 2011, 2020, 0.03], ['US_ASIA', 'KHM', 2011, 2020, 0.04],
    ['US_ASIA', 'LAO', 2011, 2020, 0.02],
    ['US_MEX', 'MEX', 2011, 2020, 1.44], ['US_CARIB', 'CUB', 2011, 2020, 0.4], ['US_CARIB', 'DOM', 2011, 2020, 0.5],
    ['US_CARIB', 'HTI', 2011, 2020, 0.2], ['US_CARIB', 'JAM', 2011, 2020, 0.2], ['US_CARIB', 'TTO', 2011, 2020, 0.05],
    ['US_CENTAM', 'SLV', 2011, 2020, 0.2], ['US_CENTAM', 'GTM', 2011, 2020, 0.1], ['US_CENTAM', 'HND', 2011, 2020, 0.1],
    ['US_CENTAM', 'NIC', 2011, 2020, 0.05], ['US_SOUTHAM', 'COL', 2011, 2020, 0.2], ['US_SOUTHAM', 'VEN', 2011, 2020, 0.15],
    ['US_SOUTHAM', 'BRA', 2011, 2020, 0.15], ['US_SOUTHAM', 'ECU', 2011, 2020, 0.1], ['US_SOUTHAM', 'PER', 2011, 2020, 0.1],
    ['US_SOUTHAM', 'ARG', 2011, 2020, 0.05], ['US_SOUTHAM', 'BOL', 2011, 2020, 0.02], ['US_SOUTHAM', 'CHL', 2011, 2020, 0.03],
    ['US_EUROPE', 'UKR', 2011, 2020, 0.15], ['US_EUROPE', 'RUS', 2011, 2020, 0.12], ['US_EUROPE', 'GBR', 2011, 2020, 0.13],
    ['US_EUROPE', 'POL', 2011, 2020, 0.08], ['US_EUROPE', 'DEU', 2011, 2020, 0.08], ['US_EUROPE', 'TUR', 2011, 2020, 0.06],
    ['US_EUROPE', 'YUG', 2011, 2020, 0.06], ['US_EUROPE', 'ROU', 2011, 2020, 0.05], ['US_EUROPE', 'KAZ', 2011, 2020, 0.03],
    ['US_EUROPE', 'ITA', 2011, 2020, 0.04], ['US_EUROPE', 'IRL', 2011, 2020, 0.02], ['US_EUROPE', 'BGR', 2011, 2020, 0.02],
    ['US_EUROPE', 'ESP', 2011, 2020, 0.02], ['US_EUROPE', 'NLD', 2011, 2020, 0.02],
    ['US_AFRICA', 'NGA', 2011, 2020, 0.14], ['US_AFRICA', 'ETH', 2011, 2020, 0.13], ['US_AFRICA', 'EGY', 2011, 2020, 0.1],
    ['US_AFRICA', 'COD', 2011, 2020, 0.12], ['US_AFRICA', 'GHA', 2011, 2020, 0.08], ['US_AFRICA', 'SOM', 2011, 2020, 0.08],
    ['US_AFRICA', 'KEN', 2011, 2020, 0.1], ['US_AFRICA', 'ERI', 2011, 2020, 0.08], ['US_AFRICA', 'SEN', 2011, 2020, 0.05],
    ['US_AFRICA', 'MAR', 2011, 2020, 0.08], ['US_AFRICA', 'ZWE', 2011, 2020, 0.08],
    ['US_CANADA', 'CAN', 2011, 2020, 0.19],
    // 2021–2024: net international migration incl. humanitarian parole and border arrivals (Census V2024, ~7M)
    ['US_SOUTHAM', 'VEN', 2021, 2024, 0.8], ['US_MEX', 'MEX', 2021, 2024, 0.7], ['US_CENTAM', 'GTM', 2021, 2024, 0.35],
    ['US_CENTAM', 'HND', 2021, 2024, 0.35], ['US_CENTAM', 'SLV', 2021, 2024, 0.15], ['US_CENTAM', 'NIC', 2021, 2024, 0.2],
    ['US_SOUTHAM', 'COL', 2021, 2024, 0.35], ['US_SOUTHAM', 'ECU', 2021, 2024, 0.3], ['US_SOUTHAM', 'PER', 2021, 2024, 0.1],
    ['US_SOUTHAM', 'BRA', 2021, 2024, 0.1], ['US_CARIB', 'CUB', 2021, 2024, 0.45], ['US_CARIB', 'HTI', 2021, 2024, 0.3],
    ['US_CARIB', 'DOM', 2021, 2024, 0.15], ['US_ASIA', 'IND', 2021, 2024, 0.8], ['US_ASIA', 'CHN', 2021, 2024, 0.4],
    ['US_ASIA', 'PHL', 2021, 2024, 0.2], ['US_ASIA', 'VNM', 2021, 2024, 0.1], ['US_ASIA', 'AFG', 2021, 2024, 0.12],
    ['US_ASIA', 'BGD', 2021, 2024, 0.08], ['US_ASIA', 'PAK', 2021, 2024, 0.08], ['US_ASIA', 'KOR', 2021, 2024, 0.05],
    ['US_ASIA', 'NPL', 2021, 2024, 0.05], ['US_AFRICA', 'NGA', 2021, 2024, 0.12], ['US_AFRICA', 'COD', 2021, 2024, 0.08],
    ['US_AFRICA', 'SEN', 2021, 2024, 0.1], ['US_AFRICA', 'ETH', 2021, 2024, 0.07], ['US_AFRICA', 'GHA', 2021, 2024, 0.06],
    ['US_AFRICA', 'KEN', 2021, 2024, 0.05], ['US_AFRICA', 'EGY', 2021, 2024, 0.05], ['US_EUROPE', 'UKR', 2021, 2024, 0.25],
    ['US_EUROPE', 'RUS', 2021, 2024, 0.1], ['US_EUROPE', 'GBR', 2021, 2024, 0.03], ['US_EUROPE', 'TUR', 2021, 2024, 0.04],
    ['US_CANADA', 'CAN', 2021, 2024, 0.06],

    // ---------------- Canada ----------------
    ['CA_EARLY', 'GBR', 1922, 1930, 0.45], ['CA_EARLY', 'USA', 1922, 1930, 0.25], ['CA_EARLY', 'DEU', 1922, 1930, 0.07],
    ['CA_EARLY', 'POL', 1922, 1930, 0.1], ['CA_EARLY', 'UKR', 1922, 1930, 0.1], ['CA_EARLY', 'SWE', 1922, 1930, 0.05],
    ['CA_EARLY', 'ITA', 1922, 1930, 0.03],
    ['CA_EARLY', 'GBR', 1931, 1940, 0.06], ['CA_EARLY', 'USA', 1931, 1940, 0.05], ['CA_EARLY', 'DEU', 1931, 1940, 0.05],
    ['CA_EARLY', 'GBR', 1941, 1950, 0.2], ['CA_EARLY', 'USA', 1941, 1950, 0.07], ['CA_EARLY', 'NLD', 1941, 1950, 0.05],
    ['CA_EARLY', 'POL', 1941, 1950, 0.06], ['CA_EARLY', 'DEU', 1941, 1950, 0.05],
    ['CA_MODERN', 'GBR', 1951, 1960, 0.4], ['CA_MODERN', 'ITA', 1951, 1960, 0.25], ['CA_MODERN', 'DEU', 1951, 1960, 0.25],
    ['CA_MODERN', 'NLD', 1951, 1960, 0.15], ['CA_MODERN', 'POL', 1951, 1960, 0.06], ['CA_MODERN', 'GRC', 1951, 1960, 0.05],
    ['CA_MODERN', 'HUN', 1951, 1960, 0.04], ['CA_MODERN', 'PRT', 1951, 1960, 0.03], ['CA_MODERN', 'USA', 1951, 1960, 0.1],
    ['CA_MODERN', 'YUG', 1951, 1960, 0.05], ['CA_MODERN', 'UKR', 1951, 1960, 0.05], ['CA_MODERN', 'SWE', 1951, 1960, 0.05],
    ['CA_MODERN', 'GBR', 1961, 1970, 0.35], ['CA_MODERN', 'ITA', 1961, 1970, 0.2], ['CA_MODERN', 'USA', 1961, 1970, 0.15],
    ['CA_MODERN', 'PRT', 1961, 1970, 0.08], ['CA_MODERN', 'GRC', 1961, 1970, 0.08], ['CA_MODERN', 'DEU', 1961, 1970, 0.08],
    ['CA_MODERN', 'JAM', 1961, 1970, 0.04], ['CA_MODERN', 'TTO', 1961, 1970, 0.03], ['CA_MODERN', 'HKG', 1961, 1970, 0.06],
    ['CA_MODERN', 'IND', 1961, 1970, 0.03], ['CA_MODERN', 'PHL', 1961, 1970, 0.02], ['CA_MODERN', 'YUG', 1961, 1970, 0.05],
    ['CA_MODERN', 'NLD', 1961, 1970, 0.05], ['CA_MODERN', 'POL', 1961, 1970, 0.03], ['CA_MODERN', 'HUN', 1961, 1970, 0.02],
    ['CA_MODERN', 'GBR', 1971, 1980, 0.2], ['CA_MODERN', 'USA', 1971, 1980, 0.2], ['CA_MODERN', 'HKG', 1971, 1980, 0.12],
    ['CA_MODERN', 'IND', 1971, 1980, 0.1], ['CA_MODERN', 'PHL', 1971, 1980, 0.06], ['CA_MODERN', 'VNM', 1971, 1980, 0.08],
    ['CA_MODERN', 'CHN', 1971, 1980, 0.04], ['CA_MODERN', 'JAM', 1971, 1980, 0.08], ['CA_MODERN', 'TTO', 1971, 1980, 0.04],
    ['CA_MODERN', 'HTI', 1971, 1980, 0.03], ['CA_MODERN', 'PRT', 1971, 1980, 0.08], ['CA_MODERN', 'ITA', 1971, 1980, 0.04],
    ['CA_MODERN', 'CHL', 1971, 1980, 0.02], ['CA_MODERN', 'COL', 1971, 1980, 0.03], ['CA_MODERN', 'ARG', 1971, 1980, 0.02],
    ['CA_MODERN', 'GRC', 1971, 1980, 0.03], ['CA_MODERN', 'LBN', 1971, 1980, 0.03], ['CA_MODERN', 'EGY', 1971, 1980, 0.02],
    ['CA_MODERN', 'DEU', 1971, 1980, 0.05], ['CA_MODERN', 'POL', 1971, 1980, 0.03], ['CA_MODERN', 'NLD', 1971, 1980, 0.04],
    ['CA_MODERN', 'YUG', 1971, 1980, 0.03], ['CA_MODERN', 'PAK', 1971, 1980, 0.03],
    ['CA_MODERN', 'HKG', 1981, 1990, 0.1], ['CA_MODERN', 'IND', 1981, 1990, 0.1], ['CA_MODERN', 'VNM', 1981, 1990, 0.1],
    ['CA_MODERN', 'PHL', 1981, 1990, 0.07], ['CA_MODERN', 'CHN', 1981, 1990, 0.07], ['CA_MODERN', 'LKA', 1981, 1990, 0.03],
    ['CA_MODERN', 'IRN', 1981, 1990, 0.03], ['CA_MODERN', 'PAK', 1981, 1990, 0.02], ['CA_MODERN', 'LBN', 1981, 1990, 0.04],
    ['CA_MODERN', 'POL', 1981, 1990, 0.08], ['CA_MODERN', 'GBR', 1981, 1990, 0.1], ['CA_MODERN', 'PRT', 1981, 1990, 0.05],
    ['CA_MODERN', 'DEU', 1981, 1990, 0.04], ['CA_MODERN', 'ITA', 1981, 1990, 0.03], ['CA_MODERN', 'JAM', 1981, 1990, 0.05],
    ['CA_MODERN', 'HTI', 1981, 1990, 0.04], ['CA_MODERN', 'SLV', 1981, 1990, 0.03], ['CA_MODERN', 'GTM', 1981, 1990, 0.02],
    ['CA_MODERN', 'CHL', 1981, 1990, 0.02], ['CA_MODERN', 'USA', 1981, 1990, 0.07], ['CA_MODERN', 'ETH', 1981, 1990, 0.02],
    ['CA_MODERN', 'GHA', 1981, 1990, 0.02], ['CA_MODERN', 'TTO', 1981, 1990, 0.02],
    ['CA_MODERN', 'HKG', 1991, 2000, 0.25], ['CA_MODERN', 'CHN', 1991, 2000, 0.25], ['CA_MODERN', 'IND', 1991, 2000, 0.2],
    ['CA_MODERN', 'PHL', 1991, 2000, 0.12], ['CA_MODERN', 'LKA', 1991, 2000, 0.07], ['CA_MODERN', 'TWN', 1991, 2000, 0.07],
    ['CA_MODERN', 'PAK', 1991, 2000, 0.08], ['CA_MODERN', 'IRN', 1991, 2000, 0.05], ['CA_MODERN', 'VNM', 1991, 2000, 0.05],
    ['CA_MODERN', 'KOR', 1991, 2000, 0.04], ['CA_MODERN', 'LBN', 1991, 2000, 0.04], ['CA_MODERN', 'IRQ', 1991, 2000, 0.03],
    ['CA_MODERN', 'GBR', 1991, 2000, 0.07], ['CA_MODERN', 'POL', 1991, 2000, 0.07], ['CA_MODERN', 'YUG', 1991, 2000, 0.07],
    ['CA_MODERN', 'RUS', 1991, 2000, 0.07], ['CA_MODERN', 'UKR', 1991, 2000, 0.05], ['CA_MODERN', 'ROU', 1991, 2000, 0.05],
    ['CA_MODERN', 'FRA_O', 1991, 2000, 0.03], ['CA_MODERN', 'SOM', 1991, 2000, 0.04], ['CA_MODERN', 'ETH', 1991, 2000, 0.03],
    ['CA_MODERN', 'GHA', 1991, 2000, 0.03], ['CA_MODERN', 'DZA', 1991, 2000, 0.03], ['CA_MODERN', 'MAR', 1991, 2000, 0.03],
    ['CA_MODERN', 'NGA', 1991, 2000, 0.02], ['CA_MODERN', 'COD', 1991, 2000, 0.02], ['CA_MODERN', 'JAM', 1991, 2000, 0.04],
    ['CA_MODERN', 'HTI', 1991, 2000, 0.03], ['CA_MODERN', 'SLV', 1991, 2000, 0.02], ['CA_MODERN', 'COL', 1991, 2000, 0.02],
    ['CA_MODERN', 'MEX', 1991, 2000, 0.02], ['CA_MODERN', 'TTO', 1991, 2000, 0.03], ['CA_MODERN', 'USA', 1991, 2000, 0.07],
    ['CA_MODERN', 'CHN', 2001, 2010, 0.36], ['CA_MODERN', 'IND', 2001, 2010, 0.3], ['CA_MODERN', 'PHL', 2001, 2010, 0.2],
    ['CA_MODERN', 'PAK', 2001, 2010, 0.15], ['CA_MODERN', 'KOR', 2001, 2010, 0.07], ['CA_MODERN', 'IRN', 2001, 2010, 0.06],
    ['CA_MODERN', 'LKA', 2001, 2010, 0.05], ['CA_MODERN', 'BGD', 2001, 2010, 0.03], ['CA_MODERN', 'TWN', 2001, 2010, 0.03],
    ['CA_MODERN', 'HKG', 2001, 2010, 0.03], ['CA_MODERN', 'VNM', 2001, 2010, 0.02], ['CA_MODERN', 'LBN', 2001, 2010, 0.03],
    ['CA_MODERN', 'IRQ', 2001, 2010, 0.03], ['CA_MODERN', 'AFG', 2001, 2010, 0.02],
    ['CA_MODERN', 'GBR', 2001, 2010, 0.1], ['CA_MODERN', 'FRA_O', 2001, 2010, 0.05], ['CA_MODERN', 'ROU', 2001, 2010, 0.05],
    ['CA_MODERN', 'RUS', 2001, 2010, 0.04], ['CA_MODERN', 'UKR', 2001, 2010, 0.04], ['CA_MODERN', 'DEU', 2001, 2010, 0.03],
    ['CA_MODERN', 'POL', 2001, 2010, 0.03], ['CA_MODERN', 'YUG', 2001, 2010, 0.03], ['CA_MODERN', 'MAR', 2001, 2010, 0.05],
    ['CA_MODERN', 'DZA', 2001, 2010, 0.05], ['CA_MODERN', 'NGA', 2001, 2010, 0.04], ['CA_MODERN', 'EGY', 2001, 2010, 0.03],
    ['CA_MODERN', 'ETH', 2001, 2010, 0.03], ['CA_MODERN', 'SOM', 2001, 2010, 0.02], ['CA_MODERN', 'COD', 2001, 2010, 0.03],
    ['CA_MODERN', 'GHA', 2001, 2010, 0.02], ['CA_MODERN', 'TUN', 2001, 2010, 0.02], ['CA_MODERN', 'COL', 2001, 2010, 0.05],
    ['CA_MODERN', 'MEX', 2001, 2010, 0.03], ['CA_MODERN', 'HTI', 2001, 2010, 0.03], ['CA_MODERN', 'JAM', 2001, 2010, 0.03],
    ['CA_MODERN', 'BRA', 2001, 2010, 0.02], ['CA_MODERN', 'VEN', 2001, 2010, 0.02], ['CA_MODERN', 'PER', 2001, 2010, 0.02],
    ['CA_MODERN', 'USA', 2001, 2010, 0.09],
    ['CA_MODERN', 'IND', 2011, 2020, 0.5], ['CA_MODERN', 'PHL', 2011, 2020, 0.4], ['CA_MODERN', 'CHN', 2011, 2020, 0.3],
    ['CA_MODERN', 'PAK', 2011, 2020, 0.1], ['CA_MODERN', 'IRN', 2011, 2020, 0.1], ['CA_MODERN', 'KOR', 2011, 2020, 0.04],
    ['CA_MODERN', 'BGD', 2011, 2020, 0.03], ['CA_MODERN', 'VNM', 2011, 2020, 0.03], ['CA_MODERN', 'NPL', 2011, 2020, 0.02],
    ['CA_MODERN', 'LKA', 2011, 2020, 0.02], ['CA_MODERN', 'SYR', 2011, 2020, 0.08], ['CA_MODERN', 'IRQ', 2011, 2020, 0.06],
    ['CA_MODERN', 'AFG', 2011, 2020, 0.03], ['CA_MODERN', 'LBN', 2011, 2020, 0.03], ['CA_MODERN', 'EGY', 2011, 2020, 0.03],
    ['CA_MODERN', 'NGA', 2011, 2020, 0.1], ['CA_MODERN', 'ERI', 2011, 2020, 0.04], ['CA_MODERN', 'ETH', 2011, 2020, 0.03],
    ['CA_MODERN', 'COD', 2011, 2020, 0.03], ['CA_MODERN', 'DZA', 2011, 2020, 0.05], ['CA_MODERN', 'MAR', 2011, 2020, 0.05],
    ['CA_MODERN', 'TUN', 2011, 2020, 0.03], ['CA_MODERN', 'SOM', 2011, 2020, 0.02], ['CA_MODERN', 'KEN', 2011, 2020, 0.02],
    ['CA_MODERN', 'GBR', 2011, 2020, 0.06], ['CA_MODERN', 'FRA_O', 2011, 2020, 0.06], ['CA_MODERN', 'UKR', 2011, 2020, 0.03],
    ['CA_MODERN', 'RUS', 2011, 2020, 0.03], ['CA_MODERN', 'DEU', 2011, 2020, 0.02], ['CA_MODERN', 'IRL', 2011, 2020, 0.02],
    ['CA_MODERN', 'ROU', 2011, 2020, 0.02], ['CA_MODERN', 'TUR', 2011, 2020, 0.02], ['CA_MODERN', 'MEX', 2011, 2020, 0.05],
    ['CA_MODERN', 'BRA', 2011, 2020, 0.04], ['CA_MODERN', 'COL', 2011, 2020, 0.04], ['CA_MODERN', 'HTI', 2011, 2020, 0.03],
    ['CA_MODERN', 'JAM', 2011, 2020, 0.02], ['CA_MODERN', 'VEN', 2011, 2020, 0.02], ['CA_MODERN', 'USA', 2011, 2020, 0.09],
    ['CA_MODERN', 'IND', 2021, 2024, 0.6], ['CA_MODERN', 'CHN', 2021, 2024, 0.15], ['CA_MODERN', 'PHL', 2021, 2024, 0.15],
    ['CA_MODERN', 'NGA', 2021, 2024, 0.1], ['CA_MODERN', 'AFG', 2021, 2024, 0.07], ['CA_MODERN', 'PAK', 2021, 2024, 0.06],
    ['CA_MODERN', 'IRN', 2021, 2024, 0.06], ['CA_MODERN', 'SYR', 2021, 2024, 0.03], ['CA_MODERN', 'CMR', 2021, 2024, 0.04],
    ['CA_MODERN', 'ERI', 2021, 2024, 0.03], ['CA_MODERN', 'ETH', 2021, 2024, 0.03], ['CA_MODERN', 'DZA', 2021, 2024, 0.04],
    ['CA_MODERN', 'MAR', 2021, 2024, 0.03], ['CA_MODERN', 'KOR', 2021, 2024, 0.03], ['CA_MODERN', 'VNM', 2021, 2024, 0.03],
    ['CA_MODERN', 'BGD', 2021, 2024, 0.03], ['CA_MODERN', 'NPL', 2021, 2024, 0.03], ['CA_MODERN', 'UKR', 2021, 2024, 0.05],
    ['CA_MODERN', 'FRA_O', 2021, 2024, 0.04], ['CA_MODERN', 'GBR', 2021, 2024, 0.03], ['CA_MODERN', 'MEX', 2021, 2024, 0.04],
    ['CA_MODERN', 'BRA', 2021, 2024, 0.04], ['CA_MODERN', 'COL', 2021, 2024, 0.04], ['CA_MODERN', 'HTI', 2021, 2024, 0.02],
    ['CA_MODERN', 'USA', 2021, 2024, 0.04],

    // ---------------- Europe ----------------
    // interwar: labour migration into France, Spanish Civil War refugees
    ['EU_WEST_1920S', 'DZA', 1922, 1939, 0.1], ['EU_WEST_1920S', 'MAR', 1922, 1939, 0.04],
    // post-colonial and guest-worker era
    ['EU_UK', 'JAM', 1948, 1962, 0.2], ['EU_UK', 'TTO', 1948, 1962, 0.1], ['EU_UK', 'IND', 1955, 1975, 0.4],
    ['EU_UK', 'PAK', 1955, 1975, 0.3], ['EU_UK', 'BGD', 1965, 1980, 0.1], ['EU_UK', 'KEN', 1965, 1975, 0.1],
    ['EU_NL', 'IDN', 1946, 1965, 0.3], ['EU_NL', 'SUR', 1970, 1980, 0.15], ['EU_DE', 'TUR', 1961, 1973, 0.9],
    ['EU_FR', 'DZA', 1954, 1962, 1.2], ['EU_MAGHREB', 'MAR', 1963, 1990, 0.7], ['EU_MAGHREB', 'DZA', 1963, 1990, 0.5],
    ['EU_MAGHREB', 'TUN', 1963, 1990, 0.3],
    // family reunification, then the end of the Cold War
    ['EU_DE', 'TUR', 1974, 1999, 1.0], ['EU_UK', 'IND', 1976, 2000, 0.3], ['EU_UK', 'PAK', 1976, 2000, 0.3],
    ['EU_DE', 'KAZ', 1988, 2005, 1.2], ['EU_ASYLUM', 'IRQ', 1991, 2008, 0.3],
    ['EU_ASYLUM', 'IRN', 1980, 2000, 0.3], ['EU_ASYLUM', 'SOM', 1991, 2010, 0.2], ['EU_ASYLUM', 'LKA', 1985, 2005, 0.1],
    ['EU_MIX', 'NGA', 1990, 2010, 0.3], ['EU_MIX', 'GHA', 1990, 2010, 0.2], ['EU_MIX', 'SEN', 1990, 2010, 0.2],
    ['EU_MIX', 'COD', 1990, 2010, 0.15], ['EU_MIX', 'CHN', 1990, 2010, 0.5], ['EU_MIX', 'IND', 1990, 2010, 0.3],
    ['EU_MIX', 'PHL', 1990, 2010, 0.15], ['EU_MIX', 'EGY', 1990, 2010, 0.15], ['EU_MIX', 'TUR', 2000, 2010, 0.2],
    ['EU_MIX', 'ETH', 1990, 2010, 0.1], ['EU_MIX', 'ERI', 1990, 2010, 0.05],
    ['EU_UK', 'ZWE', 1998, 2010, 0.15], ['EU_UK', 'BGD', 1990, 2010, 0.15],
    // 2000s: Spain/Italy boom
    ['EU_LATAM', 'ECU', 2000, 2009, 0.5], ['EU_LATAM', 'COL', 2000, 2009, 0.4], ['EU_LATAM', 'ARG', 2000, 2009, 0.3],
    ['EU_LATAM', 'BOL', 2000, 2009, 0.2], ['EU_LATAM', 'PER', 2000, 2009, 0.2], ['EU_LATAM', 'BRA', 2000, 2010, 0.3],
    ['EU_LATAM', 'VEN', 2000, 2010, 0.1], ['EU_LATAM', 'DOM', 2000, 2010, 0.1], ['EU_MAGHREB', 'MAR', 2000, 2010, 0.8],
    // 2010s: 2015–16 asylum peak
    ['EU_ASYLUM', 'SYR', 2013, 2019, 1.1], ['EU_ASYLUM', 'AFG', 2013, 2019, 0.5], ['EU_ASYLUM', 'IRQ', 2014, 2019, 0.4],
    ['EU_ASYLUM', 'ERI', 2013, 2019, 0.15], ['EU_ASYLUM', 'NGA', 2014, 2019, 0.2], ['EU_ASYLUM', 'IRN', 2014, 2019, 0.1],
    ['EU_ASYLUM', 'PAK', 2014, 2019, 0.1], ['EU_ASYLUM', 'SOM', 2013, 2019, 0.1],
    ['EU_UK_MIX', 'IND', 2011, 2019, 0.4], ['EU_UK_MIX', 'PAK', 2011, 2019, 0.15],
    ['EU_MIX', 'MAR', 2011, 2019, 0.3], ['EU_MIX', 'CHN', 2011, 2019, 0.3], ['EU_MIX', 'PHL', 2011, 2019, 0.15],
    ['EU_MIX', 'SEN', 2011, 2019, 0.1], ['EU_MIX', 'GHA', 2011, 2019, 0.1], ['EU_MIX', 'EGY', 2011, 2019, 0.1],
    ['EU_MIX', 'TUR', 2011, 2019, 0.2], ['EU_MIX', 'BGD', 2011, 2019, 0.1], ['EU_MIX', 'DZA', 2011, 2019, 0.1],
    ['EU_MIX', 'TUN', 2011, 2019, 0.1], ['EU_LATAM', 'VEN', 2016, 2019, 0.3],
    ['EU_LATAM', 'COL', 2016, 2019, 0.3], ['EU_LATAM', 'BRA', 2011, 2019, 0.1], ['EU_LATAM', 'PER', 2016, 2019, 0.1],
    // 2020–2024: record net migration to the UK; Latin Americans to Spain
    ['EU_UK_MIX', 'IND', 2021, 2024, 0.6], ['EU_UK_MIX', 'NGA', 2021, 2024, 0.35], ['EU_UK_MIX', 'CHN', 2021, 2024, 0.3],
    ['EU_UK_MIX', 'PAK', 2021, 2024, 0.25], ['EU_UK_MIX', 'HKG', 2021, 2024, 0.15], ['EU_UK_MIX', 'ZWE', 2021, 2024, 0.1],
    ['EU_UK_MIX', 'BGD', 2021, 2024, 0.1], ['EU_UK_MIX', 'GHA', 2021, 2024, 0.1], ['EU_UK_MIX', 'PHL', 2021, 2024, 0.1],
    ['EU_LATAM', 'COL', 2021, 2024, 0.5], ['EU_LATAM', 'VEN', 2021, 2024, 0.4], ['EU_LATAM', 'PER', 2021, 2024, 0.2],
    ['EU_LATAM', 'ARG', 2021, 2024, 0.15], ['EU_LATAM', 'BRA', 2021, 2024, 0.15],
    ['EU_ASYLUM', 'SYR', 2021, 2024, 0.5], ['EU_ASYLUM', 'AFG', 2021, 2024, 0.4], ['EU_ASYLUM', 'TUR', 2021, 2024, 0.3],
    ['EU_MIX', 'MAR', 2021, 2024, 0.4], ['EU_MIX', 'IND', 2021, 2024, 0.3], ['EU_MIX', 'BGD', 2021, 2024, 0.2],
    ['EU_MIX', 'EGY', 2021, 2024, 0.15], ['EU_MIX', 'DZA', 2021, 2024, 0.15], ['EU_MIX', 'TUN', 2021, 2024, 0.1],
    ['EU_MIX', 'SEN', 2021, 2024, 0.1], ['EU_MIX', 'PAK', 2021, 2024, 0.15], ['EU_MIX', 'CHN', 2021, 2024, 0.2],
    ['EU_MIX', 'PHL', 2021, 2024, 0.1], ['EU_MIX', 'NGA', 2021, 2024, 0.1],

    // ---------------- Australia (non-Western origins; White Australia policy until 1966–73) ----------------
    ['AU_MIX', 'LBN', 1922, 1945, 0.01], ['AU_MIX', 'CHN', 1922, 1945, 0.01], ['AU_MIX', 'IND', 1922, 1945, 0.01],
    ['AU_MIX', 'IND', 1946, 1965, 0.04], ['AU_MIX', 'EGY', 1946, 1965, 0.03], ['AU_MIX', 'LBN', 1946, 1965, 0.02],
    ['AU_MIX', 'ZAF', 1946, 1965, 0.01],
    ['AU_MIX', 'LBN', 1966, 1975, 0.05], ['AU_MIX', 'TUR', 1967, 1975, 0.02], ['AU_MIX', 'IND', 1966, 1975, 0.03],
    ['AU_MIX', 'PHL', 1966, 1975, 0.02], ['AU_MIX', 'MYS', 1966, 1975, 0.03], ['AU_MIX', 'CHL', 1966, 1975, 0.02],
    ['AU_MIX', 'FJI', 1966, 1975, 0.02], ['AU_MIX', 'EGY', 1966, 1975, 0.02], ['AU_MIX', 'ZAF', 1966, 1975, 0.03],
    ['AU_MIX', 'LKA', 1966, 1975, 0.01],
    ['AU_MIX', 'VNM', 1976, 1985, 0.1], ['AU_MIX', 'LBN', 1976, 1985, 0.05], ['AU_MIX', 'PHL', 1976, 1985, 0.05],
    ['AU_MIX', 'MYS', 1976, 1985, 0.04], ['AU_MIX', 'HKG', 1976, 1985, 0.03], ['AU_MIX', 'CHN', 1976, 1985, 0.02],
    ['AU_MIX', 'IND', 1976, 1985, 0.03], ['AU_MIX', 'LKA', 1976, 1985, 0.02], ['AU_MIX', 'CHL', 1976, 1985, 0.03],
    ['AU_MIX', 'ZAF', 1976, 1985, 0.05], ['AU_MIX', 'KHM', 1976, 1985, 0.02], ['AU_MIX', 'LAO', 1976, 1985, 0.01],
    ['AU_MIX', 'HKG', 1986, 1995, 0.1], ['AU_MIX', 'VNM', 1986, 1995, 0.1], ['AU_MIX', 'PHL', 1986, 1995, 0.08],
    ['AU_MIX', 'CHN', 1986, 1995, 0.08], ['AU_MIX', 'MYS', 1986, 1995, 0.05], ['AU_MIX', 'IND', 1986, 1995, 0.05],
    ['AU_MIX', 'ZAF', 1986, 1995, 0.05], ['AU_MIX', 'LBN', 1986, 1995, 0.03], ['AU_MIX', 'FJI', 1986, 1995, 0.03],
    ['AU_MIX', 'LKA', 1986, 1995, 0.03], ['AU_MIX', 'IRQ', 1986, 1995, 0.02], ['AU_MIX', 'IRN', 1986, 1995, 0.01],
    ['AU_MIX', 'CHN', 1996, 2005, 0.1], ['AU_MIX', 'IND', 1996, 2005, 0.07], ['AU_MIX', 'ZAF', 1996, 2005, 0.08],
    ['AU_MIX', 'PHL', 1996, 2005, 0.05], ['AU_MIX', 'VNM', 1996, 2005, 0.04], ['AU_MIX', 'MYS', 1996, 2005, 0.04],
    ['AU_MIX', 'IDN', 1996, 2005, 0.03], ['AU_MIX', 'SDN', 1996, 2005, 0.03], ['AU_MIX', 'IRQ', 1996, 2005, 0.03],
    ['AU_MIX', 'AFG', 1996, 2005, 0.01], ['AU_MIX', 'LKA', 1996, 2005, 0.02], ['AU_MIX', 'FJI', 1996, 2005, 0.03],
    ['AU_MIX', 'HKG', 1996, 2005, 0.02],
    ['AU_MIX', 'IND', 2006, 2015, 0.3], ['AU_MIX', 'CHN', 2006, 2015, 0.3], ['AU_MIX', 'PHL', 2006, 2015, 0.1],
    ['AU_MIX', 'ZAF', 2006, 2015, 0.08], ['AU_MIX', 'VNM', 2006, 2015, 0.05], ['AU_MIX', 'MYS', 2006, 2015, 0.05],
    ['AU_MIX', 'LKA', 2006, 2015, 0.05], ['AU_MIX', 'PAK', 2006, 2015, 0.04], ['AU_MIX', 'NPL', 2006, 2015, 0.03],
    ['AU_MIX', 'IRQ', 2006, 2015, 0.04], ['AU_MIX', 'AFG', 2006, 2015, 0.03], ['AU_MIX', 'SYR', 2013, 2015, 0.02],
    ['AU_MIX', 'KOR', 2006, 2015, 0.03], ['AU_MIX', 'IRN', 2006, 2015, 0.03], ['AU_MIX', 'BGD', 2006, 2015, 0.02],
    ['AU_MIX', 'IDN', 2006, 2015, 0.02], ['AU_MIX', 'HKG', 2006, 2015, 0.02], ['AU_MIX', 'BRA', 2006, 2015, 0.02],
    ['AU_MIX', 'COL', 2006, 2015, 0.01], ['AU_MIX', 'FJI', 2006, 2015, 0.02], ['AU_MIX', 'ZWE', 2006, 2015, 0.02],
    ['AU_MIX', 'IND', 2016, 2024, 0.4], ['AU_MIX', 'CHN', 2016, 2024, 0.25], ['AU_MIX', 'PHL', 2016, 2024, 0.1],
    ['AU_MIX', 'NPL', 2016, 2024, 0.08], ['AU_MIX', 'VNM', 2016, 2024, 0.06], ['AU_MIX', 'PAK', 2016, 2024, 0.05],
    ['AU_MIX', 'LKA', 2016, 2024, 0.05], ['AU_MIX', 'ZAF', 2016, 2024, 0.05], ['AU_MIX', 'AFG', 2016, 2024, 0.05],
    ['AU_MIX', 'SYR', 2016, 2024, 0.03], ['AU_MIX', 'IRQ', 2016, 2024, 0.04], ['AU_MIX', 'HKG', 2016, 2024, 0.04],
    ['AU_MIX', 'MYS', 2016, 2024, 0.03], ['AU_MIX', 'KOR', 2016, 2024, 0.03], ['AU_MIX', 'BRA', 2016, 2024, 0.02],
    ['AU_MIX', 'COL', 2016, 2024, 0.02], ['AU_MIX', 'IRN', 2016, 2024, 0.03], ['AU_MIX', 'BGD', 2016, 2024, 0.02],
    ['AU_MIX', 'FJI', 2016, 2024, 0.02], ['AU_MIX', 'ZWE', 2016, 2024, 0.02], ['AU_MIX', 'KEN', 2016, 2024, 0.01],

    // ---------------- New Zealand ----------------
    ['NZ_MIX', 'CHN', 1922, 1950, 0.005], ['NZ_MIX', 'IND', 1922, 1950, 0.005],
    ['NZ_MIX', 'WSM', 1951, 1970, 0.02], ['NZ_MIX', 'COK', 1951, 1970, 0.015], ['NZ_MIX', 'TON', 1960, 1970, 0.005],
    ['NZ_MIX', 'FJI', 1951, 1970, 0.005], ['NZ_MIX', 'IND', 1951, 1970, 0.005],
    ['NZ_MIX', 'WSM', 1971, 1985, 0.03], ['NZ_MIX', 'TON', 1971, 1985, 0.015], ['NZ_MIX', 'COK', 1971, 1985, 0.01],
    ['NZ_MIX', 'FJI', 1971, 1985, 0.01], ['NZ_MIX', 'CHN', 1971, 1985, 0.005], ['NZ_MIX', 'IND', 1971, 1985, 0.01],
    ['NZ_MIX', 'CHN', 1986, 2000, 0.04], ['NZ_MIX', 'TWN', 1986, 2000, 0.02], ['NZ_MIX', 'KOR', 1986, 2000, 0.03],
    ['NZ_MIX', 'HKG', 1986, 2000, 0.02], ['NZ_MIX', 'IND', 1986, 2000, 0.02], ['NZ_MIX', 'WSM', 1986, 2000, 0.02],
    ['NZ_MIX', 'TON', 1986, 2000, 0.01], ['NZ_MIX', 'FJI', 1986, 2000, 0.02], ['NZ_MIX', 'ZAF', 1986, 2000, 0.03],
    ['NZ_MIX', 'CHN', 2001, 2015, 0.08], ['NZ_MIX', 'IND', 2001, 2015, 0.08], ['NZ_MIX', 'PHL', 2001, 2015, 0.04],
    ['NZ_MIX', 'ZAF', 2001, 2015, 0.04], ['NZ_MIX', 'KOR', 2001, 2015, 0.02], ['NZ_MIX', 'FJI', 2001, 2015, 0.03],
    ['NZ_MIX', 'WSM', 2001, 2015, 0.03], ['NZ_MIX', 'TON', 2001, 2015, 0.01],
    ['NZ_MIX', 'IND', 2016, 2024, 0.08], ['NZ_MIX', 'CHN', 2016, 2024, 0.06], ['NZ_MIX', 'PHL', 2016, 2024, 0.05],
    ['NZ_MIX', 'ZAF', 2016, 2024, 0.04], ['NZ_MIX', 'FJI', 2016, 2024, 0.02], ['NZ_MIX', 'WSM', 2016, 2024, 0.03],
    ['NZ_MIX', 'TON', 2016, 2024, 0.01], ['NZ_MIX', 'LKA', 2016, 2024, 0.01],
  ];

  // Official decade totals (millions). Rows above give the origin mix; each decade is rescaled to hit these.
  // US: DHS Table 1 (1980s/1990s adjusted for the IRCA shift noted at the top); 2020s = Census V2024 net 2021–24.
  // Canada: Statistics Canada / IRCC admissions.
  const DECADE_TOTALS = {
    US: {1920: 3.3, 1930: 0.7, 1940: 0.86, 1950: 2.5, 1960: 3.21, 1970: 4.25, 1980: 6.74, 1990: 9.2, 2000: 10.3, 2010: 10.56, 2020: 7.2},
    CA: {1920: 1.05, 1930: 0.16, 1940: 0.43, 1950: 1.54, 1960: 1.4, 1970: 1.43, 1980: 1.24, 1990: 2.23, 2000: 2.45, 2010: 2.89, 2020: 1.98},
  };
  const region = (set) => set.slice(0, 2);
  const decade = (y) => Math.floor(y / 10) * 10 - (y % 10 === 0 ? 10 : 0); // 1922–1930 -> 1920, 1931–1940 -> 1930
  const sums = {};
  for (const [set, , from, , m] of F) sums[region(set) + decade(from)] = (sums[region(set) + decade(from)] || 0) + m;
  for (const row of F) {
    const target = DECADE_TOTALS[region(row[0])]?.[decade(row[2])];
    if (target) row[4] *= target / sums[region(row[0]) + decade(row[2])];
  }

  // projections: [dest set, millions per year, origin shares]
  const PROJ = [2025, 2100];
  const PROJECTIONS = [
    ['US_MIX', 0.9, {MEX: 14, GTM: 5, HND: 5, SLV: 3, NIC: 2, CUB: 4, DOM: 4, HTI: 3, VEN: 5, COL: 5, ECU: 3, BRA: 2, PER: 2,
      IND: 14, CHN: 7, PHL: 5, VNM: 3, BGD: 2, PAK: 2, NPL: 1, AFG: 1, KOR: 1, NGA: 2, ETH: 1, COD: 1, GHA: 1, KEN: 1, EGY: 1,
      UKR: 1, RUS: 1, GBR: 1}],
    ['CA_MODERN', 0.38, {IND: 28, CHN: 7, PHL: 9, PAK: 4, IRN: 3, NGA: 7, CMR: 3, ETH: 2, ERI: 2, COD: 2, DZA: 3, MAR: 3,
      AFG: 3, SYR: 2, BGD: 2, NPL: 2, VNM: 2, KOR: 1, FRA_O: 3, GBR: 2, UKR: 2, MEX: 2, BRA: 2, COL: 2, HTI: 1, USA: 3}],
    ['EU_MIX', 1.2, {MAR: 8, DZA: 4, TUN: 3, EGY: 3, NGA: 5, SEN: 3, GHA: 2, ETH: 2, ERI: 1, SOM: 1, COD: 2, SYR: 5, AFG: 5,
      IRQ: 2, TUR: 6, IRN: 2, IND: 7, PAK: 4, BGD: 4, CHN: 3, PHL: 2, COL: 5, VEN: 4, PER: 2, BRA: 2, ARG: 1, UKR: 8, RUS: 2}],
    ['AU_MIX', 0.235, {IND: 30, CHN: 18, PHL: 8, NPL: 6, VNM: 5, PAK: 4, LKA: 4, ZAF: 4, AFG: 3, IRQ: 2, SYR: 2, HKG: 2,
      MYS: 3, KOR: 2, IDN: 2, BRA: 2, COL: 2, FJI: 1, GBR: 12}],
    ['NZ_MIX', 0.03, {IND: 25, CHN: 18, PHL: 12, ZAF: 10, FJI: 6, WSM: 5, TON: 3, LKA: 3, KOR: 2, GBR: 12}],
  ];

  // draw only people coming from outside the five destinations
  const drawn = F.filter((row) => !WESTERN.has(row[1]));
  const projections = PROJECTIONS.map(([set, rate, shares]) => {
    const kept = Object.fromEntries(Object.entries(shares).filter(([k]) => !WESTERN.has(k)));
    const all = Object.values(shares).reduce((a, b) => a + b, 0);
    const part = Object.values(kept).reduce((a, b) => a + b, 0);
    return [set, (rate * part) / all, kept];
  });

  window.FLOWS = {places: P, destinations: D, flows: drawn, projectionYears: PROJ, projections};
})();
