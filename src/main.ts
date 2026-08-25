import { createRoot } from 'octane'
import { enableHistorySync } from '@octanejs/nuqs/adapters/react'
import Root from './Root.btsx'
import './style.css'

const container = document.getElementById('app')
if (container === null) throw new Error('Missing #app container.')

enableHistorySync()
createRoot(container).render(Root, {})
