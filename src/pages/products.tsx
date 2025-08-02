import { CONFIG } from '../config-global';

import { ProductsView } from '../sections/product/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Products - ${CONFIG.appName}`}</title>

      <ProductsView />
    </>
  );
}
