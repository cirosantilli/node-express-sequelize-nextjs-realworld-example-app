import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'
import { SWRConfig } from 'swr'

import CustomLink from 'front/CustomLink'
import Navbar from 'front/Navbar'
import { appName, googleAnalyticsId, isDemo, isProduction } from 'front/config'
import { AppContext, AppContextProvider } from 'front/ts'
import routes from 'front/routes'

// Packages.
import 'ionicons/css/ionicons.min.css'
import '@fontsource/titillium-web/700.css'
import '@fontsource/source-serif-pro/400.css'
import '@fontsource/source-serif-pro/700.css'
import '@fontsource/source-sans-pro/300.css'
import '@fontsource/source-sans-pro/400.css'
import '@fontsource/source-sans-pro/600.css'
import '@fontsource/source-sans-pro/700.css'
import '@fontsource/source-sans-pro/300-italic.css'
import '@fontsource/source-sans-pro/400-italic.css'
import '@fontsource/source-sans-pro/600-italic.css'
import '@fontsource/source-sans-pro/700-italic.css'

// In tree
import 'demo.productionready.io.main.css'
import 'style.scss'

function MyHead() {
  const { title } = React.useContext(AppContext)
  const realTitle = title === undefined ? '' : title + ' - '
  return (
    <Head>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1"
      />
      <title>{realTitle + appName}</title>
    </Head>
  )
}

function handleRouteChange(url) {
  window.gtag('config', googleAnalyticsId, {
    page_path: url,
  })
}

const MyApp = ({ Component, pageProps }) => {
  // Google Analytics page switches:
  // https://stackoverflow.com/questions/60411351/how-to-use-google-analytics-with-next-js-app/62552263#62552263
  const router = useRouter()
  React.useEffect(() => {
    if (isProduction) {
      router.events.on('routeChangeComplete', handleRouteChange)
      return () => {
        router.events.off('routeChangeComplete', handleRouteChange)
      }
    }
  }, [router.events])

  return (
    <AppContextProvider>
      <SWRConfig
        value={{
          // Do everything to prevent SWR from refreshing pages automatically.
          // When users want to check for new data, they can press F5, otherwise
          // we might overwrite what they were currently looking at.
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
          shouldRetryOnError: false,
        }}
      >
        <MyHead />
        <Navbar />
        {isDemo && (
          <div className="container" style={{ marginBottom: '20px' }}>
            Source code for this website:{' '}
            <a href="https://github.com/cirosantilli/node-express-sequelize-nextjs-realworld-example-app">
              https://github.com/cirosantilli/node-express-sequelize-nextjs-realworld-example-app
            </a>
          </div>
        )}
        <Component {...pageProps} />
        <footer>
          <div className="container">
            <CustomLink href={routes.home()} className="logo-font">
              {appName.toLowerCase()}
            </CustomLink>
            <span className="attribution">
              {' '}
              © 2021. An interactive learning project from{' '}
              <a href="https://thinkster.io">Thinkster</a>. Code licensed under
              MIT.
            </span>
          </div>
        </footer>
      </SWRConfig>
    </AppContextProvider>
  )
}

export default MyApp
