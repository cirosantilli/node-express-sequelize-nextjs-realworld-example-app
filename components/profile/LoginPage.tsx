import Head from "next/head";
import React from "react";

import CustomLink from "components/common/CustomLink";
import LoginForm from "components/profile/LoginForm";

const makeLoginPage = ({ register = false }) => {
  return () => (
    <>
      <Head>
        <title>{register ? 'REGISTER' : 'LOGIN'} | NEXT REALWORLD</title>
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
              <h1 className="text-xs-center">
                {register
                  ? <>Sign up</>
                  : <>Sign in</>
                }
              </h1>
              <p className="text-xs-center">
                <CustomLink href={register ? "/user/login" : "/user/register" } >
                  {`${register ? 'Have' : 'Need' }`} an account?
                </CustomLink>
              </p>
              <LoginForm register={register} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default makeLoginPage;
