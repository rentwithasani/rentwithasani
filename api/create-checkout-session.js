// api/create-checkout-session.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { email, vehicleName, depositAmount } = req.body || {};

    if (!email || !vehicleName || !depositAmount) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const origin =
      req.headers.origin ||
      process.env.FRONTEND_URL ||
      "https://rentwithasani.com";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Reservation deposit — ${vehicleName}`,
            },
            unit_amount: Math.round(Number(depositAmount) * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/?booking=success`,
      cancel_url: `${origin}/?booking=cancelled`,
      metadata: {
        vehicleName,
        email,
        purpose: "reservation_deposit",
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe Checkout session error:", err);
    return res.status(500).json({
      error: "Unable to create checkout session.",
    });
  }
}
