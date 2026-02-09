import countriesData from '../data/countries.json';

interface Region {
  name: string;
  shortCode: string;
}

export interface CountryData {
  countryName: string;
  countryShortCode: string;
  regions: Region[];
}

const countries: CountryData[] = countriesData as CountryData[];

export function useCountries() {
  return { countries, loading: false };
}
