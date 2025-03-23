import { Helmet } from 'react-helmet-async';

import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

import { BlogView } from 'src/sections/blog/view';
// ----------------------------------------------------------------------

export default function Page() {
  const router = useRouter();
  return (
    <>
      <Helmet>
        <title> {`Blog - ${CONFIG.appName}`}</title>
      </Helmet>

      <BlogView />
    </>
  );
}
