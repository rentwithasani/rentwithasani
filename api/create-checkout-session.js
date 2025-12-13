// /api/create-checkout-session.js
// Creates a Stripe Checkout session for the reservation deposit.

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const COMPANY = {
  name: "Asani Rentals",
  baseUrl: "https://www.rentwithasani.com",
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { email, vehicleName, depositAmount } = req.body || {};

    if (!email || !vehicleName || typeof depositAmount !== "number") {
      res.status(400).json({
        error: "Missing email, vehicleName, or depositAmount.",
      });
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
              description:
                "Non-refundable reservation deposit to hold your vehicle. Rental charges and remaining balance are settled at pickup under the rental agreement.",
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      // You can customize these URLs if you want to send the user
      // to a different confirmation or thank-you screen
      success_url: `${COMPANY.baseUrl}/?status=success`,
      cancel_url: `${COMPANY.baseUrl}/?status=cancel`,
      metadata: {
        vehicleName,
        depositAmount: depositAmount.toString(),
        company: COMPANY.name,
      },
    });

    // Return both URL and sessionId so the frontend can use either
    res.status(200).json({
      id: session.id,
      url: session.url,
    });
  } catch (err) {
    console.error("Stripe create checkout session error", err);
    res.status(500).json({
      error: "Stripe session error. Please verify your Stripe settings.",
    });
  }
};
