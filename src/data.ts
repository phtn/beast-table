import { faker } from '@faker-js/faker/locale/en_US'

export const ROW_COUNT = 50_000
export const STREAM_ROW_COUNT = 12_000

export const regions = [
  'North America',
  'Latin America',
  'Europe',
  'Middle East',
  'Africa',
  'South Asia',
  'Southeast Asia',
  'Oceania',
] as const

export const industries = [
  'Fintech',
  'Health',
  'Commerce',
  'Logistics',
  'Climate',
  'Security',
  'Media',
  'Developer tools',
] as const

export const plans = ['Core', 'Scale', 'Pro', 'Enterprise'] as const
export const statuses = ['Healthy', 'Watching', 'At risk', 'Onboarding'] as const

export type Region = (typeof regions)[number]
export type Industry = (typeof industries)[number]
export type Plan = (typeof plans)[number]
export type AccountStatus = (typeof statuses)[number]

export interface PerformanceRow {
  id: string
  account: string
  contact: string
  email: string
  region: Region
  industry: Industry
  plan: Plan
  status: AccountStatus
  revenue: number
  seats: number
  health: number
  latency: number
  events: number
  updatedAt: number
}

faker.seed(24_082_026)
faker.setDefaultRefDate('2026-08-25T12:00:00.000Z')

const seedStartedAt = performance.now()

export const performanceRows: PerformanceRow[] = Array.from(
  { length: ROW_COUNT },
  (_, index) => {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()

    return {
      id: `AC-${String(index + 1).padStart(6, '0')}`,
      account: faker.company.name(),
      contact: `${firstName} ${lastName}`,
      email: faker.internet
        .email({ firstName, lastName, provider: 'example.dev' })
        .toLowerCase(),
      region: faker.helpers.arrayElement(regions),
      industry: faker.helpers.arrayElement(industries),
      plan: faker.helpers.arrayElement(plans),
      status: faker.helpers.arrayElement(statuses),
      revenue: faker.number.int({ min: 1_200, max: 240_000 }),
      seats: faker.number.int({ min: 3, max: 900 }),
      health: faker.number.int({ min: 38, max: 100 }),
      latency: faker.number.int({ min: 18, max: 680 }),
      events: faker.number.int({ min: 300, max: 48_000 }),
      updatedAt: faker.date.recent({ days: 30 }).getTime(),
    }
  },
)

export const seedDurationMs = performance.now() - seedStartedAt
export const streamRows = performanceRows.slice(0, STREAM_ROW_COUNT)

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

export const formatCompact = (value: number) =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)

export const formatRelativeTime = (timestamp: number) => {
  const minutes = Math.max(1, Math.round((Date.now() - timestamp) / 60_000))
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  return `${Math.round(hours / 24)}d ago`
}

export const statusClass = (status: AccountStatus) =>
  status === 'Healthy'
    ? 'status status-healthy'
    : status === 'Watching'
      ? 'status status-watching'
      : status === 'At risk'
        ? 'status status-risk'
        : 'status status-onboarding'
