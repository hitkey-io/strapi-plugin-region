import { createElement } from 'react';
import Icon from './components/Icon';
import CellRenderer from './components/CellRenderer';

const PLUGIN_ID = 'strapi-plugin-region';

export default {
  register(app: any) {
    app.customFields.register({
      name: 'region-select',
      pluginId: PLUGIN_ID,
      type: 'string',
      intlLabel: {
        id: `${PLUGIN_ID}.label`,
        defaultMessage: 'Region Select',
      },
      intlDescription: {
        id: `${PLUGIN_ID}.description`,
        defaultMessage: 'Select country and region',
      },
      icon: Icon,
      components: {
        Input: async () => import('./components/Input'),
      },
      options: {
        base: [
          {
            sectionTitle: {
              id: `${PLUGIN_ID}.options.section.countries`,
              defaultMessage: 'Country filtering',
            },
            items: [
              {
                name: 'options.mode',
                type: 'select',
                defaultValue: 'all',
                intlLabel: {
                  id: `${PLUGIN_ID}.options.mode.label`,
                  defaultMessage: 'Mode',
                },
                description: {
                  id: `${PLUGIN_ID}.options.mode.description`,
                  defaultMessage: 'How to filter the list of available countries',
                },
                options: [
                  {
                    key: 'all',
                    value: 'all',
                    metadatas: {
                      intlLabel: {
                        id: `${PLUGIN_ID}.options.mode.all`,
                        defaultMessage: 'All countries',
                      },
                    },
                  },
                  {
                    key: 'only',
                    value: 'only',
                    metadatas: {
                      intlLabel: {
                        id: `${PLUGIN_ID}.options.mode.only`,
                        defaultMessage: 'Only selected',
                      },
                    },
                  },
                  {
                    key: 'except',
                    value: 'except',
                    metadatas: {
                      intlLabel: {
                        id: `${PLUGIN_ID}.options.mode.except`,
                        defaultMessage: 'All except selected',
                      },
                    },
                  },
                ],
              },
              {
                name: 'options.countries',
                type: 'textarea-enum',
                intlLabel: {
                  id: `${PLUGIN_ID}.options.countries.label`,
                  defaultMessage: 'Countries',
                },
                description: {
                  id: `${PLUGIN_ID}.options.countries.description`,
                  defaultMessage: 'One country code per line (ISO alpha-2, e.g. MV, AE, TR)',
                },
                placeholder: {
                  id: `${PLUGIN_ID}.options.countries.placeholder`,
                  defaultMessage: 'MV\nAE\nTR',
                },
              },
            ],
          },
        ],
        advanced: [
          {
            sectionTitle: { id: 'global.settings', defaultMessage: 'Settings' },
            items: [
              {
                name: 'required',
                type: 'checkbox',
                intlLabel: {
                  id: `${PLUGIN_ID}.options.advanced.requiredField`,
                  defaultMessage: 'Required field',
                },
                description: {
                  id: `${PLUGIN_ID}.options.advanced.requiredField.description`,
                  defaultMessage: "You won't be able to create an entry if this field is empty",
                },
              },
            ],
          },
        ],
      },
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      name: PLUGIN_ID,
      isReady: true,
    });
  },

  bootstrap(app: any) {
    app.registerHook(
      'Admin/CM/pages/ListView/inject-column-in-table',
      ({ displayedHeaders, layout }: { displayedHeaders: any[]; layout: any }) => ({
        displayedHeaders: displayedHeaders.map((header: any) => {
          if (
            header.attribute?.customField !==
            'plugin::strapi-plugin-region.region-select'
          ) {
            return header;
          }
          return {
            ...header,
            cellFormatter: (props: any, _header: any, _meta: any) =>
              createElement(CellRenderer, { value: props[header.name] }),
          };
        }),
        layout,
      })
    );
  },

  async registerTrads({ locales }: { locales: string[] }) {
    const importedTrads: Array<{ data: Record<string, string>; locale: string }> = [];

    for (const locale of locales) {
      try {
        const data = await import(`./translations/${locale}.json`);
        importedTrads.push({
          data: prefixPluginTranslations(data.default || data),
          locale,
        });
      } catch {
        importedTrads.push({ data: {}, locale });
      }
    }

    return importedTrads;
  },
};

function prefixPluginTranslations(
  trad: Record<string, string>
): Record<string, string> {
  return Object.keys(trad).reduce(
    (acc, key) => {
      acc[`${PLUGIN_ID}.${key}`] = trad[key];
      return acc;
    },
    {} as Record<string, string>
  );
}
