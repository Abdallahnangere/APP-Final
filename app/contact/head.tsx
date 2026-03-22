export default function Head() {
  const title = 'Contact SaukiMart | Support, WhatsApp and Help Desk';
  const description = 'Contact SaukiMart support for wallet issues, data purchases, privacy requests, and partnerships.';
  const url = 'https://www.saukimart.online/contact';
  const image = 'https://www.saukimart.online/contact/opengraph-image';

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="SaukiMart contact, SaukiMart support, Nigeria data support, wallet support Nigeria, SaukiMart WhatsApp" />
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
