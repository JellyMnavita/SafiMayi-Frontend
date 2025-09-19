import { CONFIG } from '../config-global';

import { SiteForageView } from '../sections/siteforage/view';

// ----------------------------------------------------------------------

export default function SiteForagePage() {
  return (
    <>
      <title>{`Site Forage - ${CONFIG.appName}`}</title>

      <SiteForageView />
    </>
  );
}
