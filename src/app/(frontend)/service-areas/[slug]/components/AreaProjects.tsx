import Image from 'next/image'
import Link from 'next/link'
import type { Project, Media } from '@/payload-types'

interface AreaProjectsProps {
  areaName: string
  projects: Project[]
}

/**
 * "Our projects in {area}" — real portfolio projects whose location matches
 * this service area. Adds genuinely-local content + contextual internal links
 * (area → project) that help both pages get crawled and indexed. Renders
 * nothing when the area has no matching projects.
 */
export function AreaProjects({ areaName, projects }: AreaProjectsProps) {
  if (!projects.length) return null

  return (
    <section className="w-full py-12 md:py-16 bg-[#f7f9fb]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <h2 className="text-2xl md:text-3xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-3 text-center">
          Our Interior Design Projects in {areaName}
        </h2>
        <p className="text-[#626161] text-sm md:text-base text-center max-w-2xl mx-auto mb-10 [font-family:'Fahkwang',Helvetica]">
          A few of the residential and commercial interiors Desperately Seeking has completed in and
          around {areaName}.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => {
            const img = p.featuredImage as Media | null
            const url = img?.sizes?.medium?.url || img?.url || '/placeholder.webp'
            return (
              <Link
                key={p.id}
                href={`/portfolio/${p.slug}`}
                className="group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <Image
                    src={url}
                    alt={img?.alt || p.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-base font-bold text-[#01190c] [font-family:'Fahkwang',Helvetica] group-hover:text-primary transition-colors line-clamp-2">
                    {p.title}
                  </h3>
                  {p.location && <p className="text-xs text-[#626161] mt-1">{p.location}</p>}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
