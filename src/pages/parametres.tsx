import { CONFIG } from '../config-global';

import { ParametresView } from '../sections/parametres/view';

// ----------------------------------------------------------------------

export default function Parametres() {
  return (
    <>
      <title>{`Paramètres - ${CONFIG.appName}`}</title>

      <ParametresView />
    </>
  );
}
