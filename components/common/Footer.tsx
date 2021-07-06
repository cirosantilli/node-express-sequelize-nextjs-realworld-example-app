import CustomLink from "components/common/CustomLink";
import { APP_NAME } from "lib/utils/constant";

const Footer = () => (
  <footer>
    <div className="container">
      <CustomLink href="/" className="logo-font">
        {APP_NAME.toLowerCase()}
      </CustomLink>
      <span className="attribution">
        {" "}© 2021. An interactive learning project from{" "}
        <a href="https://thinkster.io">Thinkster</a>. Code licensed under MIT.
      </span>
    </div>
  </footer>
);

export default Footer;
