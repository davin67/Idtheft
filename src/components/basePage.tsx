import React from "react";

import CodeContext, { useCodeContextState } from "./codeContext";
import SEO from "./seo";
import Layout from "./layout";
import SmartLink from "./smartLink";
import TableOfContents from "./tableOfContents";
import * as Sentry from "@sentry/gatsby";

type GitHubCTAProps = {
  sourceInstanceName: string;
  relativePath: string;
};

const GitHubCTA = ({
  sourceInstanceName,
  relativePath,
}: GitHubCTAProps): JSX.Element => (
  <div className="github-cta">
    <small>
      You can{" "}
      <SmartLink
        to={`https://github.com/getsentry/sentry-docs/edit/master/src/${sourceInstanceName}/${relativePath}`}
      >
        edit this page
      </SmartLink>{" "}
      on GitHub.
    </small>
  </div>
);

type Props = {
  data?: {
    file?: {
      childMarkdownRemark?: {
        tableOfContents?: any;
        [key: string]: any;
      };
      childMdx?: {
        tableOfContents?: any;
        [key: string]: any;
      };
      [key: string]: any;
    };
  };
  pageContext?: {
    title?: string;
    description?: string;
  };
  seoTitle?: string;
  sidebar?: JSX.Element;
  children?: JSX.Element;
  prependToc?: JSX.Element;
};

export default ({
  data: { file } = {},
  pageContext = {},
  seoTitle,
  sidebar,
  children,
  prependToc,
}: Props): JSX.Element => {
  const tx = Sentry.getCurrentHub()
    .getScope()
    .getTransaction();
  if (tx) {
    tx.setStatus("ok");
  }

  const { title, description } = pageContext;
  const child = file && (file.childMarkdownRemark || file.childMdx);
  const hasToc =
    child && !child.frontmatter.notoc && !!child.tableOfContents.items;

  return (
    <Layout {...{ sidebar, pageContext }}>
      <SEO title={seoTitle || title} description={description} file={file} />

      <div className="row">
        <div
          className={
            hasToc || prependToc
              ? "col-sm-8 col-md-12 col-lg-8 col-xl-9"
              : "col-12"
          }
        >
          <h1 className="mb-3">{title}</h1>
          <div id="main">
            <CodeContext.Provider value={useCodeContextState()}>
              {children}
            </CodeContext.Provider>

            {file && (
              <GitHubCTA
                sourceInstanceName={file.sourceInstanceName}
                relativePath={file.relativePath}
              />
            )}
          </div>
        </div>
        {(hasToc || prependToc) && (
          <div className="col-sm-4 col-md-12 col-lg-4 col-xl-3">
            <React.Fragment>
              {prependToc}
              {hasToc && (
                <div className="doc-toc">
                  <div className="doc-toc-title">
                    <h6>On this page</h6>
                  </div>
                  <TableOfContents toc={child.tableOfContents} />
                </div>
              )}
            </React.Fragment>
          </div>
        )}
      </div>
    </Layout>
  );
};
