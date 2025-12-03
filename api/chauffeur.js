import { Resend } from "resend";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const data = req.body;

    const emailResponse = await resend.emails.send({
      from: "Asani Rentals <notifications@rentwithasani.com>",
      to: "reserve@rentwithasani.com",
      subject: `New Chauffeur Request from ${data.name}`,
      html: `
        <h2>New Chauffeur Request</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Service Type:</strong> ${data.serviceType}</p>
        <p><strong>Date:</strong> ${data.date}</p>
        <p><strong>Time:</strong> ${data.time}</p>
        <p><strong>Passengers:</strong> ${data.passengers}</p>
        <p><strong>Hours:</strong> ${data.hours}</p>
        <p><strong>Pickup:</strong> ${data.pickup}</p>
        <p><strong>Dropoff:</strong> ${data.dropoff}</p>
        <p><strong>Notes:</strong> ${data.notes}</p>
      `,
    });

    return res.status(200).json({ success: true, id: emailResponse.id });
  } catch (error) {
    console.error("Chauffeur API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
