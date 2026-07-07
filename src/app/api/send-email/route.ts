import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    console.log('📩 Email endpoint hit:', {
      body,
      hasBody: !!body,
    })

    const { type, name, email, mobile, address, message } = body || {}
    const RESEND_API_KEY = process.env.RESEND_API_KEY

    if (!RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not configured')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
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
              <tr><td style="padding:10px 0; font-weight:bold;">Name:</td><td>${name || 'N/A'}</td></tr>
              <tr><td style="padding:10px 0; font-weight:bold;">Mobile:</td><td>${mobile || 'N/A'}</td></tr>
              <tr><td style="padding:10px 0; font-weight:bold;">Address:</td><td>${address || 'N/A'}</td></tr>
            </table>
          </div>
          <div style="margin-top:20px; text-align:center; color:#666; font-size:12px;">
            <p>This is an automated message from Desperately Seeking website.</p>
          </div>
        </div>`
    } else if (type === 'contact') {
      emailSubject = 'New Contact Form Submission - Desperately Seeking'
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #75BF44; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">New Contact Message</h1>
          </div>
          <div style="background-color: white; padding: 30px; margin-top: 20px; border-radius: 5px;">
            <h2 style="color: #333; border-bottom: 2px solid #75BF44; padding-bottom: 10px;">Contact Details</h2>
            <table style="width: 100%; margin-top: 20px;">
              <tr><td style="padding:10px 0; font-weight:bold;">Name:</td><td>${name || 'N/A'}</td></tr>
              <tr><td style="padding:10px 0; font-weight:bold;">Email:</td><td>${email || 'N/A'}</td></tr>
              ${mobile ? `<tr><td style="padding:10px 0; font-weight:bold;">Mobile:</td><td>${mobile}</td></tr>` : ''}
            </table>
            <div style="margin-top: 30px;">
              <h3 style="color: #333;">Message:</h3>
              <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #75BF44;">
                <p style="margin: 0; white-space: pre-wrap;">${message || 'No message provided'}</p>
              </div>
            </div>
          </div>
          <div style="margin-top:20px; text-align:center; color:#666; font-size:12px;">
            <p>This is an automated message from Desperately Seeking website.</p>
          </div>
        </div>`
    } else {
      return NextResponse.json(
        { error: "Invalid request: type field must be 'appointment' or 'contact'" },
        { status: 400 }
      )
    }

    // Recipient email - use environment variable or default
    const toEmail = process.env.CONTACT_EMAIL || 'info@desperatelyseeking.xyz'

    // From email - use verified domain if available, otherwise use resend.dev
    const fromEmail = process.env.FROM_EMAIL || 'Desperately Seeking <onboarding@resend.dev>'

    // Send via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject: emailSubject,
        html: emailHtml,
      }),
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error('❌ Resend API error:', JSON.stringify(responseData, null, 2))
      console.error('Request details:', { from: fromEmail, to: toEmail })

      // Return detailed error in development
      const errorMessage = responseData.message || responseData.error?.message || 'Failed to send email'
      return NextResponse.json(
        {
          error: errorMessage,
          details: process.env.NODE_ENV === 'development' ? responseData : undefined,
        },
        { status: response.status }
      )
    }

    console.log('✅ Email sent successfully:', responseData)
    return NextResponse.json({ success: true, data: responseData }, { status: 200 })
  } catch (error: any) {
    console.error('💥 Email sending error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to send email',
      },
      { status: 500 }
    )
  }
}
