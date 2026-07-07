const redirects = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header',
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  // Redirect all requests from www.desperatelyseeking.xyz to desperatelyseeking.xyz
  const wwwSubdomainRedirect = {
    source: '/:path*',
    has: [
      {
        type: 'host',
        value: 'www.desperatelyseeking.xyz',
      },
    ],
    destination: 'https://desperatelyseeking.xyz/:path*',
    permanent: true,
  }

  // Redirect all requests from cms.desperatelyseeking.xyz to desperatelyseeking.xyz
  // Requires DNS for cms.desperatelyseeking.xyz to point to the same server
  const cmsSubdomainRedirect = {
    source: '/:path*',
    has: [
      {
        type: 'host',
        value: 'cms.desperatelyseeking.xyz',
      },
    ],
    destination: 'https://desperatelyseeking.xyz/:path*',
    permanent: true,
  }

  // NOTE: the previous site (Interior Villa) carried a long list of
  // WordPress-migration redirects here. They were domain-specific legacy and
  // have been removed for the Desperately Seeking rebrand. Add new redirects
  // via the admin panel (Redirects collection) or in this file as needed.

  return [wwwSubdomainRedirect, cmsSubdomainRedirect, internetExplorerRedirect]
}

export default redirects
