import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '6', 10)
    const category = searchParams.get('category') || ''

    const payload = await getPayload({ config: configPromise })

    // Build where clause based on category filter
    type WhereClause = {
      'category.slug'?: { equals: string }
    }

    let where: WhereClause = {}

    if (category) {
      where = { 'category.slug': { equals: category } }
    }

    const postsData = await payload.find({
      collection: 'blog-posts',
      depth: 2,
      limit,
      page,
      sort: '-publishedDate',
      where: Object.keys(where).length > 0 ? where : undefined,
    })

    return NextResponse.json({
      docs: postsData.docs,
      totalDocs: postsData.totalDocs,
      totalPages: postsData.totalPages,
      page: postsData.page,
      hasNextPage: postsData.hasNextPage,
      hasPrevPage: postsData.hasPrevPage,
    })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}
