/** Shared placeholder component — replace with real implementation per feature. */
function PlaceholderPage({ title }: { title: string }) {
  return (
    <main className="p-6 md:p-8">
      <h1 className="text-2xl font-semibold text-text">{title}</h1>
    </main>
  )
}

export default PlaceholderPage
