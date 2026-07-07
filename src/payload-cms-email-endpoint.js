// src/payload-cms-email-endpoint.js

/**
 * sendEmailHandler — Payload v3–compatible endpoint handler
 *
 * Receives POST /api/send-email
 * Body: { type: 'appointment' | 'contact', name, email, mobile, address, subject, message }
 */
export const sendEmailHandler = async (req) => {
  try {
    // Parse JSON body from the request
    const body = await req.json()

    console.log('📩 Email endpoint hit:', {
      body,
      hasBody: !!body,
      contentType: req.headers.get('content-type'),
    })

    const { type, name, email, mobile, address, subject, message } = body || {}
    const RESEND_API_KEY = process.env.RESEND_API_KEY

    if (!RESEND_API_KEY) {
      return Response.json(
        { error: 'RESEND_API_KEY not configured in environment variables' },
        { status: 500 },
      )
    }

    let emailSubject = ''
    let emailHtml = ''

    if (type === 'appointment') {
      emailSubject = 'New Appointment Request - Desperately Seeking'
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #75BF44; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">New Appointment Request</h1>
          </div>
          <div style="background-color: white; padding: 30px; margin-top: 20px; border-radius: 5px;">
            <h2 style="color: #333; border-bottom: 2px solid #75BF44; padding-bottom: 10px;">Client Details</h2>
            <table style="width: 100%; margin-top: 20px;">
              <tr><td style="padding:10px 0; font-weight:bold;">Name:</td><td>${name}</td></tr>
              <tr><td style="padding:10px 0; font-weight:bold;">Mobile:</td><td>${mobile}</td></tr>
              <tr><td style="padding:10px 0; font-weight:bold;">Address:</td><td>${address}</td></tr>
            </table>
          </div>
          <div style="margin-top:20px; text-align:center; color:#666; font-size:12px;">
            <p>This is an automated message from Desperately Seeking website.</p>
          </div>
        </div>`
    } else if (type === 'contact') {
      emailSubject = subject || 'New Contact Form Submission - Desperately Seeking'
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #75BF44; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">New Contact Message</h1>
          </div>
          <div style="background-color: white; padding: 30px; margin-top: 20px; border-radius: 5px;">
            <h2 style="color: #333; border-bottom: 2px solid #75BF44; padding-bottom: 10px;">Contact Details</h2>
            <table style="width: 100%; margin-top: 20px;">
              <tr><td style="padding:10px 0; font-weight:bold;">Name:</td><td>${name}</td></tr>
              <tr><td style="padding:10px 0; font-weight:bold;">Email:</td><td>${email}</td></tr>
              ${
                mobile
                  ? `<tr><td style="padding:10px 0; font-weight:bold;">Mobile:</td><td>${mobile}</td></tr>`
                  : ''
              }
            </table>
            <div style="margin-top: 30px;">
              <h3 style="color: #333;">Message:</h3>
              <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #75BF44;">
                <p>${message}</p>
              </div>
            </div>
          </div>
          <div style="margin-top:20px; text-align:center; color:#666; font-size:12px;">
            <p>This is an automated message from Desperately Seeking website.</p>
          </div>
        </div>`
    } else {
      return Response.json(
        { error: "Invalid request: type field must be 'appointment' or 'contact'" },
        { status: 400 },
      )
    }

    // Send via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Desperately Seeking <onboarding@resend.dev>',
        to: ['info@desperatelyseeking.xyz'],
        subject: emailSubject,
        html: emailHtml,
      }),
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error('❌ Resend API error:', responseData)
      return Response.json(
        {
          error: responseData.message || 'Failed to send email',
          details: responseData,
        },
        { status: response.status },
      )
    }

    console.log('✅ Email sent successfully:', responseData)
    return Response.json({ success: true, data: responseData }, { status: 200 })
  } catch (error) {
    console.error('💥 Email sending error:', error)
    return Response.json(
      {
        error: error.message || 'Failed to send email',
        details:
          process.env.NODE_ENV === 'development'
            ? { message: error.message, stack: error.stack }
            : undefined,
      },
      { status: 500 },
    )
  }
}
