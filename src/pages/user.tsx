import { CONFIG } from '../config-global';

import { UserView } from '../sections/user/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Utilisateurs - ${CONFIG.appName}`}</title>
      <UserView />
    </>
  );
}
