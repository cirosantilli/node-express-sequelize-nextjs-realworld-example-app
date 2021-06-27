import makeArticleEditor from "components/common/editor/ArticleEditor";

import { getStaticPropsArticle } from "lib/article";

// Backend.
import sequelize from "lib/db";

export const getServerSideProps = getStaticPropsArticle();

export default makeArticleEditor();
