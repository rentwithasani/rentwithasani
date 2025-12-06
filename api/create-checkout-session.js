// /api/create-checkout-session.js
// Serverless function for Stripe hosted Checkout (deposit only)

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/**
 * Expected JSON body from frontend:
 * {
 *   email: string,
 *   vehicleName: string,
 *   depositAmount: number  // e.g. 1500 for Urus, 350 for Kia, etc.
 * }
 */
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { email, vehicleName, depositAmount } = req.body || {};

    if (!email || !vehicleName || typeof depositAmount !== "number") {
      res
        .status(400)
        .json({ error: "Missing email, vehicleName, or depositAmount." });
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

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe create checkout session error", err);
    res
      .status(500)
      .json({ error: "Stripe session error. Check server logs for details." });
  }
};
