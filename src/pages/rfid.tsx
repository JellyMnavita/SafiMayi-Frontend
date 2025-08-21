import { CONFIG } from '../config-global';

import { RFIDView } from '../sections/rfid/view';

// ----------------------------------------------------------------------

export default function RfidPage() {
  return (
    <>
      <title>{`Rfid - ${CONFIG.appName}`}</title>

      <RFIDView />
    </>
  );
}
