import { _posts } from '../_mock';
import { CONFIG } from '../config-global';

import { BlogView } from '../sections/blog/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Blog - ${CONFIG.appName}`}</title>

      <BlogView posts={_posts} />
    </>
  );
}
