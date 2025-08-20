import { CONFIG } from '../config-global';

import { CompteurView } from '../sections/compteur/view';

// ----------------------------------------------------------------------

export default function CompteurPage() {
  return (
    <>
      <title>{`Compteur - ${CONFIG.appName}`}</title>

      <CompteurView />
    </>
  );
}
