import { NextResponse, type NextRequest } from 'next/server';
import { UpdatePostSchema } from '@/domain/shared/schemas';
import {
  updatePost,
  getPostById,
  deletePost,
} from '@/app/api/services/posts/repository';

// Evitar cache para panel admin
export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await getPostById(id);
    if (!post) {
      return NextResponse.json(
        { error: 'Post no encontrado' },
        { status: 404 }
      );
    }
    return NextResponse.json(post);
  } catch (err: unknown) {
    const { id } = await params;
    console.error(`GET /api/admin/posts/${id} error`, err);
    return NextResponse.json(
      { error: 'Error obteniendo post' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const toValidate = { id, ...(body ?? {}) };
    const parsed = UpdatePostSchema.safeParse(toValidate);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await updatePost(parsed.data);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    const { id } = await params;
    console.error(`PUT /api/admin/posts/${id} error`, err);
    const code =
      typeof err === 'object' && err !== null && 'code' in err
        ? (err as Record<string, unknown>).code
        : undefined;
    if (code === 'NOT_FOUND') {
      return NextResponse.json(
        { error: 'Post no encontrado' },
        { status: 404 }
      );
    }
    if (code === 'CONFLICT') {
      return NextResponse.json({ error: 'Slug duplicado' }, { status: 409 });
    }
    return NextResponse.json(
      { error: 'Error actualizando post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deletePost(id);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const { id } = await params;
    console.error(`DELETE /api/admin/posts/${id} error`, err);
    const code =
      typeof err === 'object' && err !== null && 'code' in err
        ? (err as Record<string, unknown>).code
        : undefined;
    if (code === 'NOT_FOUND') {
      return NextResponse.json(
        { error: 'Post no encontrado' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Error eliminando post' },
      { status: 500 }
    );
  }
}
