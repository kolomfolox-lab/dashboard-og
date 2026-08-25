import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InputGroupInput } from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function VibeRenderer({ definition, restaurantId }: { definition: any; restaurantId: string }) {
  const [rows, setRows] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const cols = definition.columns || []
  const fields = definition.fields || []
  useEffect(() => {
    if (!restaurantId) return
    // For demo, load from VibeModel via custom_vibe API
    fetch(`/api/vibe/?restaurant=${restaurantId}&slug=${definition.slug}`, { headers: { Authorization: `Bearer ${localStorage.getItem('access')}` } })
      .then(r => r.json()).then(d => setRows(d.results || d || []))
      .catch(() => setRows([]))
  }, [definition.slug, restaurantId])
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{definition.title}</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm">+ Добавить</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{definition.title}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              {fields.map((f: any) => (
                <div key={f.key} className="space-y-1">
                  <Label>{f.label}</Label>
                  <InputGroupInput id={f.key} type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'} placeholder={f.label} />
                </div>
              ))}
              <Button onClick={() => setOpen(false)}>Сохранить</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow>{cols.map((c: any) => <TableHead key={c.key}>{c.label}</TableHead>)}</TableRow></TableHeader>
          <TableBody>
            {rows.length ? rows.map((r: any, i: number) => (
              <TableRow key={i}>{cols.map((c: any) => <TableCell key={c.key}>{String(r[c.key] ?? r.data?.[c.key] ?? '-')}</TableCell>)}</TableRow>
            )) : <TableRow><TableCell colSpan={cols.length} className="text-center text-muted-foreground">Нет данных — ИИ сгенерировал модуль, добавьте первую запись</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
