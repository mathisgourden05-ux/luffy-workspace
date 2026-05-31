// Variables d'environnement à configurer dans Netlify :
//   STRIPE_SECRET_KEY  → clé secrète Stripe (sk_live_... ou sk_test_...)
//   SITE_URL           → URL du site déployé (ex: https://road-spirit.netlify.app)

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  // Preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { items, email, shipping } = JSON.parse(event.body);

    if (!items || items.length === 0) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Panier vide' }),
      };
    }

    // Construit les lignes de commande Stripe
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name + (item.size ? ' — Taille ' + item.size : ''),
          ...(item.image ? { images: [item.image] } : {}),
        },
        unit_amount: Math.round(item.price * 100), // Stripe veut des centimes
      },
      quantity: item.qty,
    }));

    const siteUrl = process.env.SITE_URL || 'http://localhost:8888';

    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      locale: 'fr',
      success_url: siteUrl + '/confirmation.html?session={CHECKOUT_SESSION_ID}',
      cancel_url: siteUrl + '/panier.html',
      metadata: { source: 'road-spirit-boutique' },
    };

    if (email) sessionConfig.customer_email = email;

    // Ajoute les frais de livraison comme option Stripe
    if (shipping && shipping.cost >= 0) {
      sessionConfig.shipping_options = [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: Math.round(shipping.cost * 100),
              currency: 'eur',
            },
            display_name: shipping.label,
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 1 },
              maximum: { unit: 'business_day', value: 3 },
            },
          },
        },
      ];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error('[create-checkout] Erreur Stripe :', err.message);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: err.message }),
    };
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };
}
