// api/create-checkout-session.js
import Stripe from "stripe";

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { email, vehicleName, depositAmount } = req.body;

    if (!email || !vehicleName || !depositAmount) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Fix domain for Vercel deployments
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.VERCEL_URL ||
      "http://localhost:5173";

    const cleanOrigin = origin.startsWith("http")
      ? origin
      : `https://${origin}`;

    // Create the Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
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
      success_url: `${cleanOrigin}/?payment=success`,
      cancel_url: `${cleanOrigin}/?payment=cancel`,
    });

    console.log("Stripe session created:", session.id);

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe API Error:", error);
    return res.status(500).json({
      error: "Stripe session creation failed.",
      details: error.message,
    });
  }
}
