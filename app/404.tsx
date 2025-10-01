export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center px-6">
        <div className="retro-card w-20 h-20 flex items-center justify-center mb-6 bg-accent/20">
          <span className="text-4xl">🌱</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">Page Not Found</h1>
        <p className="text-base text-muted-foreground mb-6">
          The page you're looking for doesn't exist.
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