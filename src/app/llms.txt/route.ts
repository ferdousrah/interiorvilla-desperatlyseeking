import { getLlmsContent } from '@/utilities/getLlmsContent'

const SITE_URL = 'https://desperatelyseeking.xyz'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function GET() {
  const { services, serviceAreas } = await getLlmsContent()

  const servicesSection = services
    .map(
      (s) =>
        `- [${s.title}](${SITE_URL}/services/${s.slug}/)${
          s.shortDescription ? ` — ${s.shortDescription}` : ''
        }`,
    )
    .join('\n')

  const serviceAreasSection = serviceAreas
    .slice(0, 30)
    .map((a) => `- [${a.areaName}](${SITE_URL}/service-areas/${a.slug}/)`)
    .join('\n')

  const body = `# Desperately Seeking

> Desperately Seeking is a premier interior design and renovation company based in Bangladesh, offering end-to-end residential and commercial design services across Dhaka, Chittagong, Sylhet, and beyond.

Desperately Seeking transforms homes, offices, restaurants, retail spaces, and all types of interiors through expert design, quality craftsmanship, and full project management. Founded with a passion for beautiful, functional spaces, Desperately Seeking has completed hundreds of successful projects and is trusted by thousands of clients across Bangladesh.

## Core Services

- [All Services](${SITE_URL}/services/)
${servicesSection}

## Key Pages

- [Home](${SITE_URL}/)
- [About Us](${SITE_URL}/about/)
- [Portfolio](${SITE_URL}/portfolio/)
- [Blog](${SITE_URL}/blog/)
- [FAQ](${SITE_URL}/faq/)
- [Service Areas](${SITE_URL}/service-areas/)
- [Book Appointment](${SITE_URL}/book-appointment/)
- [Contact Us](${SITE_URL}/contact/)

## Service Areas in Bangladesh

Desperately Seeking serves clients across Bangladesh including:

${serviceAreasSection}

- [All Service Areas](${SITE_URL}/service-areas/)

## About Desperately Seeking

Desperately Seeking is staffed by experienced interior designers, architects, project managers, and skilled craftsmen who collaborate to deliver spaces that are both beautiful and functional. The company is known for:

- Transparent, itemized pricing with no hidden costs
- Free initial consultation
- 3D visualization and concept boards before construction begins
- On-time project delivery
- Sustainable material choices and support for local artisans
- End-to-end management from concept through handover and styling

## Contact & Booking

- Website: ${SITE_URL}/
- Book a free consultation: ${SITE_URL}/book-appointment/
- Contact page: ${SITE_URL}/contact/
- WhatsApp & phone inquiries available via contact page

## Blog & Resources

Desperately Seeking publishes expert articles on interior design trends, tips, and inspiration for the Bangladeshi market.

- [Latest Blog Posts](${SITE_URL}/blog/)

## Optional

- [llms-full.txt](${SITE_URL}/llms-full.txt)
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
