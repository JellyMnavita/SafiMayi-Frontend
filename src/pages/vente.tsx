import { CONFIG } from '../config-global';

import { VenteView } from '../sections/vente/view';

// ----------------------------------------------------------------------

export default function VentePage() {
  return (
    <>
      <title>{`Vente - ${CONFIG.appName}`}</title>

      <VenteView />
    </>
  );
}
