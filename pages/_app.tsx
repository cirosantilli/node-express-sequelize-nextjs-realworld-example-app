import Head from "next/head";
import React from "react";

import Footer from "components/common/Footer";
import Navbar from "components/common/Navbar";
import ContextProvider from "lib/context";
import "style.scss";

if (typeof window !== "undefined") {
  require("lazysizes/plugins/attrchange/ls.attrchange.js");
  require("lazysizes/plugins/respimg/ls.respimg.js");
  require("lazysizes");
}

const MyApp = ({ Component, pageProps }) => (
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
);

export default MyApp;
