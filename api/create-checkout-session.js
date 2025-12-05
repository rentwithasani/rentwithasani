const Stripe = require("stripe");

// Secret key from Vercel env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * POST /api/create-checkout-session
 * Body: { email, vehicleName, depositAmount }
 */
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, vehicleName, depositAmount } = req.body || {};

    if (!email || !vehicleName || typeof depositAmount !== "number") {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const amountCents = Math.round(depositAmount * 100);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: {
              name: `Reservation deposit - ${vehicleName}`,
              description:
                "Security deposit to hold your reservation with Asani Rentals.",
            },
          },
        },
      ],
      success_url: `${req.headers.origin}/?payment=success`,
      cancel_url: `${req.headers.origin}/?payment=cancel`,
      metadata: {
        email,
        vehicleName,
        depositAmount: depositAmount.toString(),
      },
    });

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe session error", err);
    return res.status(500).json({ error: "Stripe session creation failed" });
  }
};
