const PLUGIN_ID = 'strapi-plugin-region';

export default {
  register({ strapi }: { strapi: any }) {
    strapi.customFields.register({
      name: 'region-select',
      plugin: PLUGIN_ID,
      type: 'string',
    });
  },

  bootstrap({ strapi }: { strapi: any }) {
    // Collect field names that use region-select custom field across all content types
    const regionFields = new Set<string>();
    for (const contentType of Object.values(strapi.contentTypes) as any[]) {
      for (const [attrName, attr] of Object.entries(contentType.attributes) as [string, any][]) {
        if (attr.customField === 'plugin::strapi-plugin-region.region-select') {
          regionFields.add(attrName);
        }
      }
    }
    if (regionFields.size === 0) return;

    const parseRegionFields = (item: any) => {
      if (!item || typeof item !== 'object') return;
      for (const field of regionFields) {
        if (typeof item[field] === 'string') {
          try {
            item[field] = JSON.parse(item[field]);
          } catch {}
        }
      }
    };

    // Global Koa middleware — only transforms content-api responses (/api/*)
    strapi.server.use(async (ctx: any, next: any) => {
      await next();
      if (!ctx.url.startsWith('/api/')) return;
      const data = ctx.body?.data;
      if (!data) return;
      if (Array.isArray(data)) {
        data.forEach(parseRegionFields);
      } else {
        parseRegionFields(data);
      }
    });
  },
};
