import Head from "next/head";
import React from "react";

import CustomLink from "components/CustomLink";
import LoginForm from "components/LoginForm";
import { AppContext } from 'libts'
import routes from "routes";

const makeLoginPage = ({ register = false }) => {
  const title = register ? 'Sign up' : 'Sign in'
  return () => {
    const {setTitle} = React.useContext(AppContext)
    React.useEffect(() => {
      setTitle(title)
    }, [title])
    return <>
      <Head>
        <meta
          name="description"
          content={register
            ? "Please register before login"
            : "Please login to use fully-featured next-realworld site. (Post articles, comments, and like, follow etc.)"
          }
        />
      </Head>
      <div className="auth-page">
        <div className="container page">
          <div className="row">
            <div className="col-md-6 offset-md-3 col-xs-12">
              <h1 className="text-xs-center">{ title }</h1>
              <p className="text-xs-center">
                <CustomLink href={register ? routes.userLogin() : routes.userNew() } >
                  {`${register ? 'Have' : 'Need' }`} an account?
                </CustomLink>
              </p>
              <LoginForm register={register} />
            </div>
          </div>
        </div>
      </div>
    </>
  };
}

export default makeLoginPage;
