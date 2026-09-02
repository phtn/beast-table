import { useSyncExternalStore } from 'octane'
import { IconName } from './lib/icons'

export type PanelId = 'explorer' | 'analytics' | 'stream'

export interface PanelRoute {
  href: `/${PanelId}`
  id: PanelId
  label: string
  shortLabel: string
  icon: IconName
}

export const panelRoutes: readonly PanelRoute[] = [
  { id: 'explorer', href: '/explorer', label: 'Explorer', shortLabel: 'Explorer', icon: 'globe' },
  { id: 'analytics', href: '/analytics', label: 'Analytics', shortLabel: 'Analytics', icon: 'pie' },
  { id: 'stream', href: '/stream', label: 'Live Stream', shortLabel: 'Stream', icon: 'player' }
]

const navigationEvent = 'table:navigate'

const routeFromPathname = (pathname: string): PanelId => {
  const matchedRoute = panelRoutes.find((route) => route.href === pathname)
  return matchedRoute?.id ?? 'explorer'
}

const subscribe = (onRouteChange: () => void) => {
  window.addEventListener('popstate', onRouteChange)
  window.addEventListener(navigationEvent, onRouteChange)

  return () => {
    window.removeEventListener('popstate', onRouteChange)
    window.removeEventListener(navigationEvent, onRouteChange)
  }
}

const getSnapshot = () => routeFromPathname(window.location.pathname)
const getServerSnapshot = (): PanelId => 'explorer'

export const usePanelRoute = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

export const navigate = (href: PanelRoute['href']) => {
  if (window.location.pathname === href && window.location.search.length === 0) return

  window.history.pushState(window.history.state, '', href)
  window.dispatchEvent(new Event(navigationEvent))
}
