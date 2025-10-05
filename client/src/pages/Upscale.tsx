export default function Upscale() {
  return (
    <div className="w-full h-screen">
      <iframe
        src="https://wiuhh-photoupscalerpro.static.hf.space"
        className="w-full h-full border-0"
        title="Photo Upscaler Pro"
        data-testid="upscaler-iframe"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
}
