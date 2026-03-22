export default function Head() {
  const title = 'SaukiMart Developers | Data API for MTN, Airtel, Glo and 9Mobile';
  const description = 'Get SaukiMart developer API keys, plan pricing, integration docs for Node.js, PHP, Next.js and cURL.';
  const url = 'https://saukimart.online/developers';
  const image = 'https://saukimart.online/developers/opengraph-image';

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="SaukiMart API, Nigeria data API, MTN API, Airtel API, Glo API, 9Mobile API, developer portal" />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
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
