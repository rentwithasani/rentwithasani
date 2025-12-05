const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

/**
 * Vercel serverless function: POST /api/create-checkout-session
 * Expects JSON: { email, vehicleName, depositAmount }
 * Returns: { url } for Stripe Checkout
 */
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, vehicleName, depositAmount } = req.body || {};

    if (!email || !vehicleName || !depositAmount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const origin =
      process.env.PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
      "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Deposit for ${vehicleName}`,
            },
            unit_amount: Math.round(Number(depositAmount) * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/?status=success`,
      cancel_url: `${origin}/?status=cancelled`,
      metadata: {
        vehicleName,
        email,
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe session error", err);
    return res
      .status(500)
      .json({ error: "Unable to create checkout session" });
  }
};
