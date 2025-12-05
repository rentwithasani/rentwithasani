// api/create-checkout-session.js
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const { email, vehicleName, depositAmount } = req.body;

    if (!email || !vehicleName || !depositAmount) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Convert dollars to cents for Stripe
    const amountInCents = Math.round(Number(depositAmount) * 100);

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
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      // Where Stripe sends customer after payment or cancel
      success_url: `${req.headers.origin}/?status=success`,
      cancel_url: `${req.headers.origin}/?status=cancelled`,
      metadata: {
        vehicleName,
      },
    });

    // We're using the session's hosted URL
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error", err);
    res.status(500).json({ error: "Stripe error" });
  }
};
