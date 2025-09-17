import { CONFIG } from '../config-global';

import { JournauxView } from '../sections/journaux_system/view';

// ----------------------------------------------------------------------

export default function JournauxPage() {
  return (
    <>
      <title>{`Journaux System- ${CONFIG.appName}`}</title>

      <JournauxView />
    </>
  );
}
