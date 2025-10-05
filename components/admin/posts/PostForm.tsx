'use client';

import { useTransition, useState, useMemo } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreatePostSchema } from '@/domain/shared/schemas';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { axios } from '@/lib/http/axios';
import { isAxiosError } from 'axios';

// Importante: usar el tipo de ENTRADA del schema para que coincida con zodResolver
type FormValues = z.input<typeof CreatePostSchema>;

type PostFormProps = {
  edit?: boolean;
  initialValues?: Partial<FormValues> & { id?: string | null };
};

export function PostForm({ edit = false, initialValues }: PostFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const defaults = useMemo<FormValues>(
    () => ({
      slug: (initialValues?.slug as string) ?? '',
      title: (initialValues?.title as string) ?? '',
      excerpt: (initialValues?.excerpt as string) ?? '',
      content: (initialValues?.content as string) ?? '',
      coverImage:
        typeof initialValues?.coverImage === 'string'
          ? initialValues?.coverImage
          : null,
      tags: Array.isArray(initialValues?.tags)
        ? (initialValues?.tags as string[])
        : [],
      status: (initialValues?.status as FormValues['status']) ?? 'draft',
      // Evitar problemas de tipo en cliente: mantener null
      publishedAt: null,
    }),
    [initialValues]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(CreatePostSchema),
    defaultValues: edit
      ? defaults
      : {
          slug: '',
          title: '',
          excerpt: '',
          content: '',
          coverImage: null,
          tags: [],
          status: 'draft',
          publishedAt: null,
        },
    mode: 'onSubmit',
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    setError(null);
    startTransition(async () => {
      try {
        if (edit) {
          const id = initialValues?.id;
          if (!id) throw new Error('ID del post no disponible');
          await axios.put(`/api/admin/posts/${id}`, { id, ...values });
        } else {
          await axios.post('/api/admin/posts', values);
        }
        router.push('/admin/posts');
      } catch (e) {
        const msg = isAxiosError(e)
          ? (e.response?.data?.error as string) || e.message
          : e instanceof Error
          ? e.message
          : 'Error creando post';
        setError(msg);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="ej: mi-primer-post" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Título del post" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resumen</FormLabel>
              <FormControl>
                <Input
                  placeholder="Opcional breve descripción"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenido</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Markdown o texto"
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (comma separated)</FormLabel>
              <FormControl>
                <Input
                  placeholder="nextjs,typescript"
                  value={(field.value || []).join(',')}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean)
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button type="submit" disabled={isPending}>
          {isPending
            ? edit
              ? 'Guardando...'
              : 'Creando...'
            : edit
            ? 'Guardar cambios'
            : 'Crear'}
        </Button>
      </form>
    </Form>
  );
}
