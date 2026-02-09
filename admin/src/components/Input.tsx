import { forwardRef, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Field, Combobox, ComboboxOption, Grid } from '@strapi/design-system';
import { Provider as TooltipProvider } from '@radix-ui/react-tooltip';
import { useCountries } from '../hooks/useCountries';

const PLUGIN_ID = 'strapi-plugin-region';

interface RegionValue {
  country: string;
  region: string | null;
}

interface InputProps {
  name: string;
  value: string | null;
  onChange: (event: { target: { name: string; value: string | null; type: string } }) => void;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  labelAction?: React.ReactNode;
  attribute?: {
    options?: {
      mode?: string;
      countries?: string[];
    };
    [key: string]: any;
  };
}

const Input = forwardRef<HTMLDivElement, InputProps>((props, ref) => {
  const { name, value, onChange, label, error, hint, required, disabled, attribute } = props;
  const { formatMessage } = useIntl();
  const { countries: allCountries } = useCountries();

  const mode = attribute?.options?.mode || 'all';
  const configuredCodes = useMemo(() => {
    const raw = attribute?.options?.countries;
    if (!Array.isArray(raw)) return [];
    return raw.map((c: string) => c.trim().toUpperCase()).filter(Boolean);
  }, [attribute?.options?.countries]);

  const parsed: RegionValue | null = useMemo(() => {
    if (!value) return null;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    }
    return value;
  }, [value]);

  const selectedCountry = parsed?.country || null;
  const selectedRegion = parsed?.region || null;

  const countries = useMemo(() => {
    if (mode === 'all' || configuredCodes.length === 0) return allCountries;
    if (mode === 'only') {
      return allCountries.filter((c) => configuredCodes.includes(c.countryShortCode));
    }
    if (mode === 'except') {
      return allCountries.filter((c) => !configuredCodes.includes(c.countryShortCode));
    }
    return allCountries;
  }, [mode, configuredCodes, allCountries]);

  const countryData = useMemo(
    () => allCountries.find((c) => c.countryShortCode === selectedCountry) ?? null,
    [selectedCountry, allCountries]
  );
  const regions = countryData?.regions ?? [];
  const regionData = useMemo(
    () => regions.find((r) => r.shortCode === selectedRegion) ?? null,
    [selectedRegion, regions]
  );

  const handleCountryChange = (countryCode: string | undefined) => {
    onChange({
      target: {
        name,
        value: countryCode ? JSON.stringify({ country: countryCode, region: null }) : null,
        type: 'string',
      },
    });
  };

  const handleRegionChange = (regionCode: string | undefined) => {
    if (!selectedCountry || !regionCode) return;
    onChange({
      target: {
        name,
        value: JSON.stringify({ country: selectedCountry, region: regionCode }),
        type: 'string',
      },
    });
  };

  return (
    <TooltipProvider>
    <Field.Root name={name} id={name} error={error} hint={hint} required={required} ref={ref}>
      <Field.Label>{label}</Field.Label>
      <Grid.Root gap={4}>
        <Grid.Item col={6} s={12} xs={12} direction="column" alignItems="stretch">
          <Combobox
            value={selectedCountry}
            onChange={handleCountryChange}
            onClear={() => handleCountryChange(undefined)}
            clearLabel={formatMessage({
              id: `${PLUGIN_ID}.clear.country`,
              defaultMessage: 'Clear country',
            })}
            disabled={disabled}
            placeholder={formatMessage({
              id: `${PLUGIN_ID}.placeholder.country`,
              defaultMessage: 'Select country...',
            })}
            autocomplete={{ type: 'both', filter: 'startsWith' }}
          >
            {countries.map((c) => (
              <ComboboxOption key={c.countryShortCode} value={c.countryShortCode}>
                {c.countryName}
              </ComboboxOption>
            ))}
          </Combobox>
        </Grid.Item>
        {selectedCountry && regions.length > 0 && (
          <Grid.Item col={6} s={12} xs={12} direction="column" alignItems="stretch">
            <Combobox
              key={selectedCountry}
              value={selectedRegion}
              onChange={handleRegionChange}
              onClear={() => {
                onChange({
                  target: {
                    name,
                    value: JSON.stringify({ country: selectedCountry!, region: null }),
                    type: 'string',
                  },
                });
              }}
              clearLabel={formatMessage({
                id: `${PLUGIN_ID}.clear.region`,
                defaultMessage: 'Clear region',
              })}
              disabled={disabled}
              placeholder={formatMessage({
                id: `${PLUGIN_ID}.placeholder.region`,
                defaultMessage: 'Select region...',
              })}
              autocomplete={{ type: 'both', filter: 'startsWith' }}
            >
              {regions.map((r) => (
                <ComboboxOption key={r.shortCode} value={r.shortCode}>
                  {r.name}
                </ComboboxOption>
              ))}
            </Combobox>
          </Grid.Item>
        )}
      </Grid.Root>
      <Field.Hint />
      <Field.Error />
    </Field.Root>
    </TooltipProvider>
  );
});

Input.displayName = 'RegionSelectInput';

export default Input;
