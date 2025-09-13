import { Resend } from "resend"
import { format } from "date-fns"
import type { Booking } from "./types"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendBookingConfirmation(booking: Booking) {
  try {
    const formattedDate = format(new Date(booking.bookingDate), "EEEE, MMMM do, yyyy")

    const addOnsText =
      Object.entries(booking.addOns)
        .filter(([_, selected]) => selected)
        .map(([addon]) => addon.charAt(0).toUpperCase() + addon.slice(1).replace(/([A-Z])/g, " $1"))
        .join(", ") || "None"

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Booking Confirmation - NOMADIC</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #ddd; border-top: none; }
            .booking-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #8B4513; }
            .total { font-size: 18px; font-weight: bold; color: #8B4513; border-top: 2px solid #8B4513; padding-top: 10px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏕️ NOMADIC</h1>
              <h2>Booking Confirmation</h2>
            </div>
            
            <div class="content">
              <p>Dear ${booking.customerName},</p>
              
              <p>Thank you for booking your desert adventure with NOMADIC! Your booking has been confirmed and payment has been processed successfully.</p>
              
              <div class="booking-details">
                <h3 style="color: #8B4513; margin-top: 0;">Booking Details</h3>
                
                <div class="detail-row">
                  <span class="detail-label">Booking Date:</span>
                  <span>${formattedDate}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Location:</span>
                  <span>${booking.location}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Number of Tents:</span>
                  <span>${booking.numberOfTents}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Add-ons:</span>
                  <span>${addOnsText}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Children Included:</span>
                  <span>${booking.hasChildren ? "Yes" : "No"}</span>
                </div>
                
                ${
                  booking.notes
                    ? `
                <div class="detail-row">
                  <span class="detail-label">Special Notes:</span>
                  <span>${booking.notes}</span>
                </div>
                `
                    : ""
                }
                
                <div class="detail-row">
                  <span class="detail-label">Subtotal:</span>
                  <span>AED ${booking.subtotal.toFixed(2)}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">VAT (5%):</span>
                  <span>AED ${booking.vat.toFixed(2)}</span>
                </div>
                
                <div class="detail-row total">
                  <span class="detail-label">Total Paid:</span>
                  <span>AED ${booking.total.toFixed(2)}</span>
                </div>
              </div>
              
              <h3 style="color: #8B4513;">What's Included:</h3>
              <ul>
                <li>Premium camping tents with comfortable bedding</li>
                <li>Traditional Arabic breakfast</li>
                <li>Campfire setup and maintenance</li>
                <li>Basic camping equipment</li>
                <li>Professional guide and safety briefing</li>
                <li>Transportation to/from meeting point</li>
              </ul>
              
              <h3 style="color: #8B4513;">Important Information:</h3>
              <ul>
                <li>Please arrive at the meeting point 30 minutes before departure</li>
                <li>Bring comfortable clothing suitable for desert conditions</li>
                <li>Don't forget sunscreen, hat, and plenty of water</li>
                <li>Camera recommended for capturing memories</li>
              </ul>
              
              <p>We're excited to host you for an unforgettable desert experience! If you have any questions or need to make changes to your booking, please contact us immediately.</p>
              
              <p>Best regards,<br>The NOMADIC Team</p>
            </div>
            
            <div class="footer">
              <p>NOMADIC Desert Adventures<br>
              Email: info@nomadic.ae | Phone: +971 XX XXX XXXX<br>
              Follow us on social media for more adventures!</p>
            </div>
          </div>
        </body>
      </html>
    `

    const { data, error } = await resend.emails.send({
      from: "NOMADIC <bookings@nomadic.ae>",
      to: [booking.customerEmail],
      subject: `Booking Confirmed - ${formattedDate} Desert Adventure`,
      html: emailHtml,
    })

    if (error) {
      console.error("Error sending confirmation email:", error)
      throw error
    }

    console.log("Confirmation email sent successfully:", data?.id)
    return data
  } catch (error) {
    console.error("Failed to send booking confirmation email:", error)
    throw error
  }
}

export async function sendAdminNotification(booking: Booking) {
  try {
    const formattedDate = format(new Date(booking.bookingDate), "EEEE, MMMM do, yyyy")

    const addOnsText =
      Object.entries(booking.addOns)
        .filter(([_, selected]) => selected)
        .map(([addon]) => addon.charAt(0).toUpperCase() + addon.slice(1).replace(/([A-Z])/g, " $1"))
        .join(", ") || "None"

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Booking Alert - NOMADIC Admin</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #ddd; border-top: none; }
            .booking-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 8px 0; padding: 5px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #dc2626; }
            .total { font-size: 18px; font-weight: bold; color: #dc2626; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 New Booking Alert</h1>
              <p>NOMADIC Admin Dashboard</p>
            </div>
            
            <div class="content">
              <p><strong>A new booking has been confirmed and paid!</strong></p>
              
              <div class="booking-details">
                <h3 style="color: #dc2626; margin-top: 0;">Customer Information</h3>
                
                <div class="detail-row">
                  <span class="detail-label">Name:</span>
                  <span>${booking.customerName}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span>${booking.customerEmail}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Phone:</span>
                  <span>${booking.customerPhone}</span>
                </div>
                
                <h3 style="color: #dc2626;">Booking Details</h3>
                
                <div class="detail-row">
                  <span class="detail-label">Date:</span>
                  <span>${formattedDate}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Location:</span>
                  <span>${booking.location}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Tents:</span>
                  <span>${booking.numberOfTents}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Add-ons:</span>
                  <span>${addOnsText}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Children:</span>
                  <span>${booking.hasChildren ? "Yes" : "No"}</span>
                </div>
                
                ${
                  booking.notes
                    ? `
                <div class="detail-row">
                  <span class="detail-label">Notes:</span>
                  <span>${booking.notes}</span>
                </div>
                `
                    : ""
                }
                
                <div class="detail-row total">
                  <span class="detail-label">Total Revenue:</span>
                  <span>AED ${booking.total.toFixed(2)}</span>
                </div>
              </div>
              
              <p><strong>Action Required:</strong> Please prepare for the upcoming booking and ensure all arrangements are in place.</p>
              
              <p>Booking ID: ${booking._id}</p>
            </div>
          </div>
        </body>
      </html>
    `

    const { data, error } = await resend.emails.send({
      from: "NOMADIC System <system@nomadic.ae>",
      to: ["admin@nomadic.ae"], // Replace with actual admin email
      subject: `🚨 New Booking: ${booking.customerName} - ${formattedDate}`,
      html: emailHtml,
    })

    if (error) {
      console.error("Error sending admin notification:", error)
      throw error
    }

    console.log("Admin notification sent successfully:", data?.id)
    return data
  } catch (error) {
    console.error("Failed to send admin notification:", error)
    throw error
  }
}
