import { Typography } from '@strapi/design-system';
import { useCountries } from '../hooks/useCountries';

interface RegionValue {
  country: string;
  region: string | null;
}

interface CellRendererProps {
  value: RegionValue | string | null;
}

const CellRenderer = ({ value }: CellRendererProps) => {
  const { countries, loading } = useCountries();

  const parsed: RegionValue | null =
    typeof value === 'string'
      ? (() => {
          try {
            return JSON.parse(value);
          } catch {
            return null;
          }
        })()
      : value;

  if (!parsed?.country) return <Typography textColor="neutral600">—</Typography>;
  if (loading) return <Typography textColor="neutral600">—</Typography>;

  const countryData = countries.find((c) => c.countryShortCode === parsed.country);
  const countryName = countryData?.countryName ?? parsed.country;

  let display = countryName;
  if (parsed.region && countryData) {
    const regionData = countryData.regions.find((r) => r.shortCode === parsed.region);
    display += `, ${regionData?.name ?? parsed.region}`;
  }

  return <Typography textColor="neutral800">{display}</Typography>;
};

export default CellRenderer;
