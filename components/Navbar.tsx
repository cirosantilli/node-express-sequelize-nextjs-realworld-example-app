import React from "react";

import CustomImage from "components/CustomImage";
import CustomLink from "components/CustomLink";
import Maybe from "components/Maybe";
import NavLink from "components/NavLink";
import { APP_NAME } from "lib/utils/constant";
import getLoggedInUser from "lib/utils/getLoggedInUser";
import { AppContext, resetIndexState } from 'libts'
import routes from "routes";

const NavbarItem = ({ children }) => (
  <li className="nav-item">{children}</li>
)

const Navbar = () => {
  const loggedInUser = getLoggedInUser()
  const { setPage, setTab } = React.useContext(AppContext)
  const clickHandler = () => resetIndexState(setPage, setTab, loggedInUser)
  return (
    <nav className="navbar navbar-light">
      <div className="container">
        <CustomLink href={routes.home()} onClick={clickHandler} className="navbar-brand">
          {APP_NAME.toLowerCase()}
        </CustomLink>
        <ul className="nav navbar-nav pull-xs-right">
          <NavbarItem>
            <NavLink href={routes.home()} onClick={clickHandler}>
              Home
            </NavLink>
          </NavbarItem>
          <Maybe test={loggedInUser}>
            <NavbarItem>
              <NavLink href={routes.articleNew()}>
                <i className="ion-compose" />
                &nbsp;New Article
              </NavLink>
            </NavbarItem>
            <NavbarItem>
              <NavLink href={routes.userEdit()}>
                <i className="ion-gear-a" />
                &nbsp;Settings
              </NavLink>
            </NavbarItem>
            <NavbarItem>
              <NavLink
                href={routes.userView(loggedInUser?.username)}
              >
                <CustomImage
                  className="user-pic"
                  src={loggedInUser?.effectiveImage}
                  alt="your profile image"
                />
                {loggedInUser?.username}
              </NavLink>
            </NavbarItem>
          </Maybe>
          <Maybe test={!loggedInUser}>
            <NavbarItem>
              <NavLink href={routes.userLogin()}>
                Sign in
              </NavLink>
            </NavbarItem>
            <NavbarItem>
              <NavLink href={routes.userNew()}>
                Sign up
              </NavLink>
            </NavbarItem>
          </Maybe>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
