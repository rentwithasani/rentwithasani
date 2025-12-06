// /api/create-checkout-session.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/**
 * Expected JSON body from frontend:
 * {
 *   email: string,
 *   vehicleName: string,
 *   depositAmount: number
 * }
 */
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { email, vehicleName, depositAmount } = body;

    if (!email || !vehicleName || typeof depositAmount !== "number") {
      res
        .status(400)
        .json({ error: "Missing or invalid email, vehicleName, or depositAmount." });
      return;
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("Missing STRIPE_SECRET_KEY env var");
      res
        .status(500)
        .json({ error: "Stripe is not configured on the server. Please contact support." });
      return;
    }

    const amountInCents = Math.round(depositAmount * 100);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${vehicleName} — Reservation deposit`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      success_url: "https://www.rentwithasani.com/?status=success",
      cancel_url: "https://www.rentwithasani.com/?status=cancel",
      metadata: {
        vehicleName,
        depositAmount: depositAmount.toString(),
      },
    });

    // Preferred: redirect via URL on frontend
    res.status(200).json({ url: session.url, id: session.id });
  } catch (err) {
    console.error("Stripe create checkout session error", err);
    res
      .status(500)
      .json({ error: "Stripe session error. Please contact support." });
  }
};
