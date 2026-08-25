import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppShell } from '@/components/app/AppShell'
import { VibeRenderer } from '@/components/app/VibeRenderer'
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace'

export default function VibeModulePage() {
  const { slug } = useParams<{ slug: string }>()
  const { restaurant } = useOwnerWorkspace(true)
  const [def, setDef] = useState<any>(null)
  useEffect(() => {
    if (!slug) return
    fetch(`/api/marketplace/${slug}/`, { headers: { Authorization: `Bearer ${localStorage.getItem('access')}` } })
      .then(r => r.json()).then(d => setDef(d.module?.definition || d.definition))
      .catch(() => setDef(null))
  }, [slug])
  if (!def) return <AppShell><div className="p-8">Загрузка модуля {slug}...</div></AppShell>
  return (
    <AppShell>
      <div className="p-6">
        <VibeRenderer definition={def} restaurantId={String(restaurant?.id || '')} />
      </div>
    </AppShell>
  )
}
