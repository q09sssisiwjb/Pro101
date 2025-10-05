const ImageToSketch = () => {
  return (
    <div className="h-full w-full" style={{ margin: 0, padding: 0, border: "none", outline: "none" }}>
      <iframe
        src="https://wiuhh-sketch-ai.hf.space"
        width="100%"
        height="100%"
        title="Image to Sketch Tool"
        style={{ 
          border: "none", 
          margin: 0, 
          padding: 0, 
          display: "block",
          outline: "none",
          borderRadius: 0,
          boxShadow: "none"
        }}
        data-testid="iframe-image-to-sketch"
      />
    </div>
  );
};

export default ImageToSketch;