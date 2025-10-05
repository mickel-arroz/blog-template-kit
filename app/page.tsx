// File: app/page.tsx
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function Page() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold">En Construcción</h1>
      <p className="text-muted-foreground mt-2">
        Esta página estará disponible próximamente.
      </p>
    </div>
  );
}
