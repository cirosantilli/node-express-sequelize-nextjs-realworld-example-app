import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

import Footer from "components/common/Footer";
import Navbar from "components/common/Navbar";
import { googleAnalyticsId, isProduction } from "config";
import ContextProvider from "lib/context";
import "ionicons/css/ionicons.min.css";
import "style.scss";

const MyApp = ({ Component, pageProps }) => {
  if (isProduction) {
    // Google Analytics page switches:
    // https://stackoverflow.com/questions/60411351/how-to-use-google-analytics-with-next-js-app/62552263#62552263
    const router = useRouter();
    const handleRouteChange = (url) => {
      window.gtag('config', googleAnalyticsId, {
        page_path: url,
      });
    };
    useEffect(() => {
      router.events.on('routeChangeComplete', handleRouteChange);
      return () => {
        router.events.off('routeChangeComplete', handleRouteChange);
      };
    }, [router.events]);
  }
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </Head>
      <ContextProvider>
        <Navbar />
        <Component {...pageProps} />
        <Footer />
      </ContextProvider>
    </>
  )
};

export default MyApp;
