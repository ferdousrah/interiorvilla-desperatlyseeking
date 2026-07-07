import { getPayload, PayloadRequest } from 'payload'
import configPromise from '@payload-config'

/**
 * Projects API endpoint handler for infinite scroll
 * GET /api/projects-feed?page=1&limit=9&filter=all
 */
export const getProjectsHandler = async (req: PayloadRequest) => {
  try {
    const url = new URL(req.url || '', 'http://localhost')
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const limit = parseInt(url.searchParams.get('limit') || '9', 10)
    const filter = url.searchParams.get('filter') || 'all'

    const payload = await getPayload({ config: configPromise })

    // Build where clause based on filter
    type WhereClause = {
      isResidential?: { equals: boolean }
      isCommercial?: { equals: boolean }
      isArchitectural?: { equals: boolean }
    }

    let where: WhereClause = {}

    if (filter === 'residential') {
      where = { isResidential: { equals: true } }
    } else if (filter === 'commercial') {
      where = { isCommercial: { equals: true } }
    } else if (filter === 'architectural') {
      where = { isArchitectural: { equals: true } }
    }

    const projectsData = await payload.find({
      collection: 'projects',
      depth: 2,
      limit,
      page,
      sort: 'portfolioPosition',
      where: Object.keys(where).length > 0 ? where : undefined,
    })

    return Response.json({
      docs: projectsData.docs,
      totalDocs: projectsData.totalDocs,
      totalPages: projectsData.totalPages,
      page: projectsData.page,
      hasNextPage: projectsData.hasNextPage,
      hasPrevPage: projectsData.hasPrevPage,
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return Response.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}
