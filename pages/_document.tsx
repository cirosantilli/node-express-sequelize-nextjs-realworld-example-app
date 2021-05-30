import { extractCritical } from "emotion-server";
import Document, { Html, Head, Main, NextScript } from "next/document";
import React from "react";
import flush from "styled-jsx/server";

interface IProps {
  css: any;
}

class MyDocument extends Document<IProps> {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    const { html, head } = ctx.renderPage();
    const styles = flush();
    const emotionStyles = extractCritical(html);
    return { ...emotionStyles, ...initialProps, html, head, styles };
  }

  render() {
    const { ids }: any = this.props;

    return (
      <Html lang="en">
        <Head>
          <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta name="robots" content="index, follow" />
          <meta key="googlebot" name="googlebot" content="index,follow" />
          <meta name="google" content="notranslate" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="keywords" content="nextjs, realworld" />
          <meta property="og:locale" content="en_US" />
          <meta property="og:site_name" content="next-realworld" />
          <meta property="og:title" content="Next.js realworld example app" />
          <meta
            property="og:description"
            content="Next.js + SWR codebase containing realworld examples"
          />
          <meta property="og:url" content="https://next-realworld.now.sh/" />
          <meta
            property="og:image"
            content="https://next-realworld.now.sh/images/share-link.png"
          />
          <meta property="twitter:card" content="next-realworld" />
          <meta
            property="twitter:url"
            content="https://next-realworld.now.sh/"
          />
          <meta
            property="twitter:title"
            content="Next.js realworld example app"
          />
          <meta
            property="twitter:description"
            content="Next.js + SWR codebase containing realworld examples"
          />
          <meta
            property="twitter:image"
            content="https://machimban.com/images/talk-link.jpg"
          />
          <meta name="msapplication-TileColor" content="#000" />
          <meta
            name="msapplication-TileImage"
            content="/images/ms-icon-144x144.png"
          />
          <meta name="theme-color" content="#000" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: `{
              "@context": "http://schema.org/",
              "@type": "Organization",
              "url": "https://next-realworld.now.sh/",
              "logo": "https://next-realworld.now.sh/images/share-link.png",
              "sameAs": [
                "https://realworld.io",
                "https://medium.com/@ericsimons/introducing-realworld-6016654d36b5",
              ],
            }`,
            }}
          />
          <link rel="stylesheet" href="//demo.productionready.io/main.css" />
          <link
            rel="stylesheet"
            href="//code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css"
          />
          <link
            rel="stylesheet"
            href="//fonts.googleapis.com/css?family=Titillium+Web:700|Source+Serif+Pro:400,700|Merriweather+Sans:400,700|Source+Sans+Pro:400,300,600,700,300italic,400italic,600italic,700italic&display=swap"
          />
          <style
            data-emotion-css={ids.join(" ")}
            dangerouslySetInnerHTML={{ __html: this.props.css }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
