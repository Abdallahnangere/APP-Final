export default function Head() {
  const title = 'SaukiMart Privacy Policy | Data Protection and User Rights';
  const description = 'Read SaukiMart privacy policy including data handling, retention, security and your rights.';
  const url = 'https://www.saukimart.online/privacy';
  const image = 'https://www.saukimart.online/privacy/opengraph-image';

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="SaukiMart privacy policy, data protection Nigeria, NDPC privacy, fintech privacy policy" />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="article" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </>
  );
}
