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
      regionOverrides?: string[];
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

  const overridesMap = useMemo(() => {
    const map = new Map<string, Array<{ name: string; shortCode: string }>>();
    const raw = attribute?.options?.regionOverrides;
    if (!Array.isArray(raw)) return map;
    for (const line of raw) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const firstColon = trimmed.indexOf(':');
      if (firstColon === -1) continue;
      const secondColon = trimmed.indexOf(':', firstColon + 1);
      if (secondColon === -1) continue;
      const countryCode = trimmed.slice(0, firstColon).trim().toUpperCase();
      const shortCode = trimmed.slice(firstColon + 1, secondColon).trim();
      const regionName = trimmed.slice(secondColon + 1).trim();
      if (!countryCode || !shortCode || !regionName) continue;
      if (!map.has(countryCode)) map.set(countryCode, []);
      map.get(countryCode)!.push({ name: regionName, shortCode });
    }
    return map;
  }, [attribute?.options?.regionOverrides]);

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
  const hasCustomRegions = selectedCountry ? overridesMap.has(selectedCountry) : false;
  const effectiveRegions = useMemo(() => {
    if (!selectedCountry) return [];
    if (hasCustomRegions) return overridesMap.get(selectedCountry)!;
    return countryData?.regions ?? [];
  }, [selectedCountry, hasCustomRegions, overridesMap, countryData]);
  const regionData = useMemo(
    () => effectiveRegions.find((r) => r.shortCode === selectedRegion) ?? null,
    [selectedRegion, effectiveRegions]
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
            textValue={countryData?.countryName ?? ''}
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
        {selectedCountry && effectiveRegions.length > 0 && (
          <Grid.Item col={6} s={12} xs={12} direction="column" alignItems="stretch">
            <Combobox
              key={selectedCountry}
              value={selectedRegion}
              textValue={regionData?.name ?? ''}
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
              {effectiveRegions.map((r) => (
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
