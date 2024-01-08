import React, { useRef, useEffect } from 'react';

const SoundCurvePreview = ({ gain, distanceModel, rolloffFactor, refDistance, maxDistance }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const aspectRatio = 0.5;

  const topMargin = 20; // Space for the top bar
  const bottomMargin = 20; // Space for the bottom bar

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, width, height);

    const propertiesPanel = document.getElementById('properties-panel');
    const bkColor = window.getComputedStyle(propertiesPanel).backgroundColor;
    const cornerRadius = 12;
    const barColor = '#C5C58A';
  
    // Ruler lines
    const drawRuler = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const { width, height } = canvas;
      
      // Add the max distance text and arrows
      const text = `<---- ${maxDistance}m ---->`;
      const textPositionX = width / 2;
      const textPositionY = 12; // Adjust as needed to ensure it's within the visible area

      // Draw a background on the top with the top corners rounded, the bar has to be colored with barColor 
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width, 0);
      ctx.lineTo(width, topMargin);
      ctx.lineTo(0, topMargin);
      ctx.lineTo(0, 0);
      ctx.fillStyle = bkColor;
      ctx.fill();
      ctx.closePath();
      // Now draw the top bar with the barColor and the corners rounded
      ctx.beginPath();
      ctx.moveTo(cornerRadius, 0);
      ctx.lineTo(width - cornerRadius, 0);
      ctx.arcTo(width, 0, width, cornerRadius, cornerRadius);
      ctx.lineTo(width, topMargin);
      ctx.lineTo(0, topMargin);
      ctx.lineTo(0, cornerRadius);
      ctx.arcTo(0, 0, cornerRadius, 0, cornerRadius);
      ctx.closePath();
      ctx.fillStyle = barColor; // Use the background color
      ctx.fill();
      //Also draw horizontal line below the top bar
      ctx.beginPath();
      ctx.moveTo(0, topMargin);
      ctx.lineTo(width, topMargin);
      ctx.stroke();
      
      // Now we do the same for the bottom bar
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(width, height);
      ctx.lineTo(width, height - bottomMargin);
      ctx.lineTo(0, height - bottomMargin);
      ctx.lineTo(0, height);
      ctx.fillStyle = bkColor;
      ctx.fill();
      ctx.closePath();
      // Now draw the bottom bar with the barColor and the corners rounded
      ctx.beginPath();
      ctx.moveTo(cornerRadius, height);
      ctx.lineTo(width - cornerRadius, height);
      ctx.arcTo(width, height, width, height - cornerRadius, cornerRadius);
      ctx.lineTo(width, height - bottomMargin);
      ctx.lineTo(0, height - bottomMargin);
      ctx.lineTo(0, height - cornerRadius);
      ctx.arcTo(0, height, cornerRadius, height, cornerRadius);
      ctx.closePath();
      ctx.fillStyle = barColor; // Use the background color
      ctx.fill();
      //Also draw horizontal line above the bottom bar
      ctx.beginPath();
      ctx.moveTo(0, height - bottomMargin);
      ctx.lineTo(width, height - bottomMargin);
      ctx.stroke();

      


      // Set text style
      ctx.font = '14px Arial'; // Adjust size as needed
      ctx.fillStyle = 'black'; // Ensure this color contrasts with the background
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle'; // Centers text vertically

      // Draw the text
      ctx.fillText(text, textPositionX, textPositionY);

      // Desired range for the number of segments
      const minSegments = 10;
      const maxSegments = 19;

      // Calculate the interval of meters per segment
      let interval = maxDistance / maxSegments; // Start with the largest interval that would give the maximum segments
      if (maxDistance / interval < minSegments) {
        interval = maxDistance / minSegments; // Adjust the interval to ensure at least the minimum number of segments
      }

      // Round the interval to the nearest whole number for nicer ruler markings
      interval = Math.ceil(interval);

      // Calculate the number of segments based on the interval
      const baseSegments = maxDistance / interval;
      const numSegments = Math.ceil(baseSegments);
      const drawingHeight = height - topMargin - bottomMargin;

      // Draw vertical lines for the ruler within the adjusted drawing area
      ctx.beginPath();
      ctx.strokeStyle = 'gray';

      // Ruler width has to be adjusted according to the difference between width and segments difference
      const rulerWidth = width * (numSegments / baseSegments);
       

      // Draw segment distance indications at the bottom bar
      for (let i = 1; i < numSegments; i++) {
        
        let lineY = topMargin + drawingHeight * 0.85;
        const x = (i / numSegments) * rulerWidth;
        const segmentDistance = `${i * interval}m`;
        if (i % Math.ceil(numSegments / 10) === 0) { // Label significant segments to avoid clutter
          ctx.fillText(segmentDistance, x, height - 8);
          lineY = topMargin + drawingHeight;
        }


        ctx.moveTo(x, topMargin); // Start from the top margin
        ctx.lineTo(x, lineY); // Extend to the bottom of the adjusted drawing area
      }
      ctx.stroke();
    };
  
    // Sound fall-off curve
    const drawCurve = () => {
      const ctx = canvas.getContext('2d');
      const { width, height } = canvas;

      // Adjust the drawing area for the curve
      const drawingHeight = height - topMargin - bottomMargin;
      
      ctx.beginPath();
      ctx.moveTo(0, drawingHeight + topMargin); // Start at the bottom-left corner, full volume
  
      for (let x = 0; x <= width; x++) {
        // Map the x coordinate to the distance
        const distance = (x / width) * maxDistance;
        let volumeAttenuation;
  
        // Calculate the volume attenuation based on the distance model
        if (distance <= refDistance) {
          // No attenuation at the reference distance or closer
          volumeAttenuation = 1;
        } else {
          // Apply attenuation after the reference distance
          switch (distanceModel) {
            case 'linear':
              volumeAttenuation = Math.max(0, 1 - rolloffFactor * (distance - refDistance) / (maxDistance - refDistance));
              break;
            case 'inverse':
              volumeAttenuation = refDistance / (refDistance + rolloffFactor * (distance - refDistance));
              break;
            case 'exponential':
              volumeAttenuation = Math.exp(-rolloffFactor * (distance - refDistance));
              break;
            default:
              volumeAttenuation = 1; // Should not occur, but default to no attenuation
          }
        }
  
        const y = drawingHeight * (1 - volumeAttenuation) + topMargin;
        ctx.lineTo(x, y);
      }
  
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'blue';
      ctx.stroke();
    };
  
    drawRuler();
    drawCurve();



    // Ensure you scale your drawing to the canvas's actual size
    // This might involve scaling positions and dimensions by `window.devicePixelRatio`
  };

  useEffect(() => {
    // Define resizeCanvas inside useEffect so it has access to the latest props
    const resizeCanvas = () => {
      if (containerRef.current && canvasRef.current) {
        const container = containerRef.current;
        const canvas = canvasRef.current;
  
        // Calculate the container's width accounting for padding
        const style = window.getComputedStyle(container);
        const containerWidth = Math.min(container.offsetWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight), 350); // Limit width to 350 and prevent overflow
  
        // Set the actual size of the canvas
        const scale = window.devicePixelRatio; // Adjust for device pixel density
        canvas.width = containerWidth * scale;
        canvas.height = containerWidth * aspectRatio * scale;
  
        // Scale the canvas back down with CSS (to avoid blurriness)
        canvas.style.width = `${containerWidth}px`;
        canvas.style.height = `${containerWidth * aspectRatio}px`;
  
        // Redraw everything on the canvas
        draw();
      }
    };
  
    const resizeObserver = new ResizeObserver(resizeCanvas);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
  
    // Clean up
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [gain, distanceModel, rolloffFactor, refDistance, maxDistance]); // Include all props that affect drawing

  useEffect(() => {
    // Redraw the canvas when dependencies change
    draw();
  }, [distanceModel, rolloffFactor, refDistance, maxDistance]); // Dependencies for re-rendering the curve

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', maxWidth: '350px', padding: '1em', margin: '0 auto' }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}

export default SoundCurvePreview;
