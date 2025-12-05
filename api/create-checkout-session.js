// api/create-checkout-session.js
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, vehicleName, depositAmount } = req.body || {};

    if (!email || !vehicleName || !depositAmount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

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
              name: `Deposit — ${vehicleName}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      success_url: "https://rentwithasani.com/?status=success",
      cancel_url: "https://rentwithasani.com/?status=cancel",
    });

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe checkout session error", err);
    return res.status(500).json({ error: "Stripe error" });
  }
};
