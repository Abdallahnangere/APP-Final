export default function Head() {
  const title = 'SaukiMart App | Buy Data, Send Money, Download Receipts';
  const description = 'Open SaukiMart app to buy data, transfer to users, view activity, manage wallet and receipts.';
  const url = 'https://www.saukimart.online/app';
  const image = 'https://www.saukimart.online/app/opengraph-image';

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="SaukiMart app, buy data app Nigeria, data wallet app, send money SaukiMart, Nigeria fintech app" />
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
