export function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <a href="/" className="mb-6 inline-block text-sm text-brand-600 hover:underline">← Retour à l'accueil</a>
      <h1 className="mb-6 text-2xl font-bold">{title}</h1>
      <div className="prose prose-sm max-w-none space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300 [&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-gray-900 dark:[&_h2]:text-gray-100">
        {children}
      </div>
    </main>
  );
}
