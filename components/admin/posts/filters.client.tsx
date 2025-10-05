'use client';

import * as React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function AdminPostsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [q, setQ] = React.useState(sp.get('q') ?? '');
  const initialStatus = sp.get('status') ?? 'all';
  const [status, setStatus] = React.useState<string>(initialStatus);

  function apply() {
    const params = new URLSearchParams(sp.toString());
    if (q) params.set('q', q);
    else params.delete('q');
    if (status && status !== 'all') params.set('status', status);
    else params.delete('status');
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="flex flex-col gap-1">
        <Label htmlFor="q">Buscar</Label>
        <Input
          id="q"
          value={q}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setQ(e.target.value)
          }
          placeholder="título o resumen"
          className="w-64"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="status">Estado</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger id="status" className="min-w-40">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={apply} variant="outline">
        Aplicar
      </Button>
    </div>
  );
}
