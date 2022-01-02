import React from 'react'

import CustomImage from 'front/CustomImage'
import CustomLink from 'front/CustomLink'
import Maybe from 'front/Maybe'
import NavLink from 'front/NavLink'
import { appName } from 'front/config'
import useLoggedInUser from 'front/useLoggedInUser'
import { AppContext, resetIndexState } from 'front/ts'
import routes from 'front/routes'

const NavbarItem = ({ children }) => <li className="nav-item">{children}</li>

const Navbar = () => {
  const loggedInUser = useLoggedInUser()
  const { setPage, setTab } = React.useContext(AppContext)
  const clickHandler = () => resetIndexState(setPage, setTab, loggedInUser)
  return (
    <nav className="navbar navbar-light">
      <div className="container">
        <CustomLink
          href={routes.home()}
          onClick={clickHandler}
          className="navbar-brand"
        >
          {appName.toLowerCase()}
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
              <NavLink href={routes.userView(loggedInUser?.username)}>
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
              <NavLink href={routes.userLogin()}>Sign in</NavLink>
            </NavbarItem>
            <NavbarItem>
              <NavLink href={routes.userNew()}>Sign up</NavLink>
            </NavbarItem>
          </Maybe>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
