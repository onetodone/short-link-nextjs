export function SiteFooter() {
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 p-4 text-sm text-muted-foreground sm:px-8">
        <p>ShortLink — internal tool.</p>
        <p>OneToDone &copy; {new Date().getFullYear()}</p>
      </div>
    </footer>
  )
}
