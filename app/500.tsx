export default function ServerError() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center px-6">
        <div className="retro-card w-20 h-20 flex items-center justify-center mb-6 bg-destructive/10">
          <span className="text-4xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">Something went wrong</h1>
        <p className="text-base text-muted-foreground mb-6">
          We're experiencing technical difficulties. Please try again later.
        </p>
        <a
          href="/"
          className="retro-button inline-block"
        >
          Go Home
        </a>
      </div>
    </div>
  )
}