import { CONFIG } from '../config-global';

import { ForbiddenView } from '../sections/error';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`403 Forbidden - ${CONFIG.appName}`}</title>

      <ForbiddenView />
    </>
  );
}
