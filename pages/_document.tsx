import Document, { Html, Head, Main, NextScript } from "next/document";
import React from "react";
import { googleAnalyticsId, isProduction } from "config";

interface IProps {
  css: any;
}

class MyDocument extends Document<IProps> {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    const { html, head } = ctx.renderPage();
    return { ...initialProps, html, head };
  }

  render() {
    const { ids }: any = this.props;
    return (
      <Html lang="en">
        <Head>
          {isProduction &&
            <>
              <script async src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}></script>
              <script
                dangerouslySetInnerHTML={{
                  __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${googleAnalyticsId}', { page_path: window.location.pathname });
`,
                }}
              />
            </>
          }
          <link rel="stylesheet" href="//demo.productionready.io/main.css" />
          <link
            rel="stylesheet"
            href="//fonts.googleapis.com/css?family=Titillium+Web:700|Source+Serif+Pro:400,700|Merriweather+Sans:400,700|Source+Sans+Pro:400,300,600,700,300italic,400italic,600italic,700italic&display=swap"
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
