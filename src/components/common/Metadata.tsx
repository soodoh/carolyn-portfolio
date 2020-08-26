import React, { ReactElement } from 'react';
import { Helmet } from 'react-helmet';

interface MetadataProps {
  title: string;
  description?: string;
  robots?: string;
}

const Metadata = (props: MetadataProps): ReactElement => {
  const { title, description, robots } = props;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="google-site-verification" content="mZWTxlscBqxebm-E7NiMf8dG-G2qbqKKODr0BoCUobQ" />

      {description && <meta name="description" content={description} />}

      <meta name="robots" content={robots || 'index, follow'} />
    </Helmet>
  );
};

export default Metadata;
