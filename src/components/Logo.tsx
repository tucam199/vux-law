export function Logo() {
  return (
    <div className="flex items-center gap-4" aria-label="VUX Visual User Experience">
      <div className="flex items-end gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: '#F2C4B3' }}>
            VUX
          </h1>
          <p className="text-xs font-light text-muted-foreground tracking-widest -mt-1">
            Visual User Experience
          </p>
        </div>
      </div>
    </div>
  );
}
