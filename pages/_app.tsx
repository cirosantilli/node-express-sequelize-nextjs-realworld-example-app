import { CacheProvider } from "@emotion/core";
import { cache } from "emotion";
import Head from "next/head";
import React from "react";

import Footer from "components/common/Footer";
import Layout from "components/common/Layout";
import Navbar from "components/common/Navbar";
import ContextProvider from "lib/context";
import "styles.css";

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
    <CacheProvider value={cache}>
      <ContextProvider>
        <Navbar />
        <Component {...pageProps} />
        <Footer />
      </ContextProvider>
    </CacheProvider>
  </>
);

export default MyApp;
