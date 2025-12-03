// api/create-checkout-session.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, vehicleName, depositAmount } = req.body;

    if (!email || !vehicleName || !depositAmount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

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
            unit_amount: Math.round(depositAmount * 100), // dollars → cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.rentwithasani.com"}/?status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.rentwithasani.com"}/?status=cancel`,
    });

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe error", err);
    return res.status(500).json({ error: "Stripe session creation failed" });
  }
}
