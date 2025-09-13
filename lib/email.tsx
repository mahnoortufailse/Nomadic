import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendBookingConfirmation(booking: any) {
  return resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: booking.email,
    subject: "Booking Confirmation",
    html: `<p>Thanks for booking with us, ${booking.name}!</p>`,
  });
}

export async function sendAdminNotification(booking: any) {
  return resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: "admin@yourdomain.com",
    subject: "New Booking Received",
    html: `<p>Booking confirmed for ${booking.name} on ${booking.bookingDate} at ${booking.location}.</p>`,
  });
}
