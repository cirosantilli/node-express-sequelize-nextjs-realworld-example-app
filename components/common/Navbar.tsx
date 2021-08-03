import React from "react";
import Link from "next/link";

import CustomImage from "components/common/CustomImage";
import CustomLink from "components/common/CustomLink";
import Maybe from "components/common/Maybe";
import NavLink from "components/common/NavLink";
import { APP_NAME } from "lib/utils/constant";
import { usePageDispatch } from "lib/context/PageContext";
import getLoggedInUser from "lib/utils/getLoggedInUser";

const NavbarItem = ({ children }) => (
  <li className="nav-item">{children}</li>
)

const Navbar = () => {
  const setPage = usePageDispatch();
  const loggedInUser = getLoggedInUser()
  const handleClick = React.useCallback(() => setPage(0), []);
  return (
    <nav className="navbar navbar-light">
      <div className="container">
        <CustomLink href="/" onClick={handleClick} className="navbar-brand">
          {APP_NAME.toLowerCase()}
        </CustomLink>
        <ul className="nav navbar-nav pull-xs-right">
          <NavbarItem>
            <NavLink href="/" onClick={handleClick}>
              Home
            </NavLink>
          </NavbarItem>
          <Maybe test={loggedInUser}>
            <NavbarItem>
              <NavLink href="/editor">
                <i className="ion-compose" />
                &nbsp;New Article
              </NavLink>
            </NavbarItem>
            <NavbarItem>
              <NavLink href="/settings">
                <i className="ion-gear-a" />
                &nbsp;Settings
              </NavLink>
            </NavbarItem>
            <NavbarItem>
              <NavLink
                href={`/profile/${loggedInUser?.username}`}
                onClick={handleClick}
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
              <NavLink href="/user/login">
                Sign in
              </NavLink>
            </NavbarItem>
            <NavbarItem>
              <NavLink href="/user/register">
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
