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
      subject: `New Contact Form Submission`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Message:</strong><br>${data.message}</p>
      `,
    });

    return res.status(200).json({ success: true, id: emailResponse.id });
  } catch (error) {
    console.error("Contact API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
