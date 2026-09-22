const secretKey = process.env.PAYMONGO_SECRET_KEY;

if (!secretKey) {
  console.error('Set PAYMONGO_SECRET_KEY as an environment variable before running this.');
  process.exit(1);
}

(async () => {
  const authHeader = `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`;

  const response = await fetch('https://api.paymongo.com/v1/merchants/capabilities/payment_methods', {
    headers: { Authorization: authHeader },
  });

  const body = await response.json();
  console.log(JSON.stringify(body, null, 2));
})();