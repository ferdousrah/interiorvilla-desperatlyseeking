// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

import Projects from './collections/Projects'
import ProjectCategories from './collections/ProjectCategories'
import Services from './collections/Services'
import Testimonials from './collections/Testimonials'
import TeamMembers from './collections/TeamMembers'
import BlogPosts from './collections/BlogPosts'
import BlogCategories from './collections/BlogCategories'
import Offices from './collections/Offices'
import Slider from './collections/Slider'
import ServiceArea from './collections/ServiceArea'
import GoogleReviews from './collections/GoogleReviews'
import CostEstimates from './collections/CostEstimates'
import GalleryCategories from './collections/GalleryCategories'
import GalleryItems from './collections/GalleryItems'

import Home from './globals/Home'
import About from './globals/About'
import Portfolio from './globals/Portfolio'
import Contact from './globals/Contact'
import Blog from './globals/Blog'
import CostEstimatorSettings from './globals/CostEstimatorSettings'
import CeoMessage from './globals/CeoMessage'
import DesignersPage from './globals/DesignersPage'
import SuccessStoriesPage from './globals/SuccessStoriesPage'
import GalleryPage from './globals/GalleryPage'
import SiteSettings from './globals/SiteSettings'
import { sendEmailHandler } from './payload-cms-email-endpoint.js'
import { getProjectsHandler } from './endpoints/projects'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL, // e.g. https://cms.desperatelyseeking.xyz
  defaultDepth: 1, // relationships (like photo) populate by default in API
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    // Schema auto-sync (drizzle "push") runs ONLY in dev — the adapter itself
    // refuses to push when NODE_ENV=production. In production the schema is
    // managed by prodMigrations below, which run automatically at init.
    push: process.env.NODE_ENV !== 'production',
    // Migrations in src/migrations — run automatically when NODE_ENV=production
    // (including during `next build`), so a fresh database gets its schema
    // before static generation queries it.
    prodMigrations: migrations,
    pool: {
      connectionString: process.env.DATABASE_URI || '',
      // The DB is remote, so idle TCP connections get silently dropped by the
      // network/firewall. Without these, the pool hands out dead connections
      // until the process is restarted. keepAlive keeps connections warm AND
      // detects dead ones; the short idle timeout recycles them proactively.
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
      allowExitOnIdle: false,
    },
  }),
  collections: [
    Pages,
    Posts,
    Media,
    Categories,
    Users,
    Projects,
    ProjectCategories,
    Services,
    Testimonials,
    TeamMembers,
    BlogPosts,
    BlogCategories,
    Offices,
    Slider,
    ServiceArea,
    GoogleReviews,
    CostEstimates,
    GalleryCategories,
    GalleryItems,
  ],
  cors: {
    origins: [
      'http://localhost:3000',
      'https://desperatelyseeking.xyz',
      'https://www.desperatelyseeking.xyz',
    ],
    headers: ['x-custom-header'],
  },
  csrf: ['http://localhost:3000', 'https://desperatelyseeking.xyz', 'https://www.desperatelyseeking.xyz'],
  globals: [
    Header,
    Footer,
    Home,
    Blog,
    About,
    Portfolio,
    Contact,
    CostEstimatorSettings,
    CeoMessage,
    DesignersPage,
    SuccessStoriesPage,
    GalleryPage,
    SiteSettings,
  ],
  plugins: [
    ...plugins,
    // storage-adapter-placeholder
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  endpoints: [
    {
      path: '/send-email',
      method: 'post',
      handler: sendEmailHandler,
    },
    {
      path: '/projects-feed',
      method: 'get',
      handler: getProjectsHandler,
    },
  ],
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
})
