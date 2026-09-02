import './style.css'

const container = document.getElementById('app')
if (container === null) throw new Error('Missing #app container.')

void Promise.all([
  import('octane'),
  import('@octanejs/nuqs/adapters/react'),
  import('./Root.btsx'),
]).then(([{ createRoot }, { enableHistorySync }, { default: Root }]) => {
  enableHistorySync()
  createRoot(container).render(Root, {})
})
