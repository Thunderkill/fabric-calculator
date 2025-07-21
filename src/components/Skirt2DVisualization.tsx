import React from 'react';

interface PanelDimensions {
  id: number;
  waistWidth: number;
  hemWidth: number;
  height: number;
  waistWidthWithSeam: number;
  hemWidthWithSeam: number;
  heightWithSeam: number;
}

interface Skirt2DVisualizationProps {
  panels: PanelDimensions[];
  cutAllowance: number;
  fabricWidth: number;
}

const Skirt2DVisualization: React.FC<Skirt2DVisualizationProps> = ({ panels, cutAllowance, fabricWidth }) => {
  if (!panels || panels.length === 0) {
    return <p>Please calculate panels to see the 2D visualization.</p>;
  }

  if (fabricWidth <= 0) {
    return <p>Please enter a valid Fabric Width.</p>;
  }

  // Sort panels by hem width (or waist width, depending on desired layout strategy)
  // For simplicity, let's assume we lay them out side-by-side, alternating direction for efficiency
  const sortedPanels = [...panels].sort((a, b) => b.hemWidthWithSeam - a.hemWidthWithSeam);

  let totalFabricHeight = 0; // We will calculate the required length

  // Simple layout: place panels side by side, assuming fabric width is sum of max widths
  // and fabric height is max panel height. This is a basic approach and can be optimized.
  // For A-line panels, a common efficient layout is alternating direction (upside down)
  // to nest the wider hems into the narrower waists.

  // Let's implement a basic alternating layout for better fabric utilization within the given fabricWidth
  let currentX = 0;
  let currentRowHeight = 0;
  const rows: { x: number; y: number; panel: PanelDimensions; rotated: boolean }[][] = [[]];
  let currentRowIndex = 0;


  sortedPanels.forEach((panel, index) => {
    const panelWidth = Math.max(panel.waistWidthWithSeam, panel.hemWidthWithSeam);
    const panelHeight = panel.heightWithSeam;

    // Determine if rotating this panel would be beneficial (e.g., if height > width)
    // For A-line skirts, rotating every other panel (upside down) is a common fabric-saving technique.
    // We'll assume this alternating rotation for now.
    const rotated = index % 2 !== 0; // Alternate rotation for every other panel

    // Calculate effective dimensions for layout purposes
    // For 180-degree rotation, the effective layout dimensions remain the same as original.
    // The nesting efficiency comes from the placement, not from swapping dimensions.
    const effectiveLayoutWidth = panelWidth;
    const effectiveLayoutHeight = panelHeight;

    // Check if the current panel fits in the current row within the given fabricWidth
    // If not, start a new row
    if (rows[currentRowIndex].length > 0 && currentX + effectiveLayoutWidth + cutAllowance > fabricWidth) {
      currentRowIndex++;
      rows[currentRowIndex] = [];
      totalFabricHeight += currentRowHeight + cutAllowance; // Add height of previous row + allowance
      currentX = 0; // Reset X for new row
      currentRowHeight = 0; // Reset row height
    }

    rows[currentRowIndex].push({
      x: currentX,
      y: totalFabricHeight,
      panel: panel,
      rotated: rotated,
    });
 
    currentX += effectiveLayoutWidth + cutAllowance;
    currentRowHeight = Math.max(currentRowHeight, effectiveLayoutHeight);
  });

  totalFabricHeight += currentRowHeight; // Add the height of the last row

  // Adjust totalFabricWidth and totalFabricHeight to remove the last cutAllowance if it's at the very end
  // Adjust totalFabricHeight to remove the last cutAllowance if it's at the very end
  if (totalFabricHeight > 0 && rows[0].length > 0) { // Only adjust if there are panels
    totalFabricHeight -= cutAllowance;
  }

  // Scale for visualization
  const visualizationWidth = 600;
  const visualizationHeight = 400;
  const padding = 20;

  // Ensure totalFabricHeight is not zero to avoid division by zero in scaling
  const effectiveTotalFabricHeight = totalFabricHeight > 0 ? totalFabricHeight : 1; // Use 1 to prevent division by zero

  const scaleX = (visualizationWidth - 2 * padding) / fabricWidth;
  const scaleY = (visualizationHeight - 2 * padding) / effectiveTotalFabricHeight;
  const scale = Math.min(scaleX, scaleY);

  const scaledFabricWidth = fabricWidth * scale;
  const scaledTotalFabricHeight = effectiveTotalFabricHeight * scale;

  // If scale is too small, panels might become invisible.
  // Let's set a minimum scale or adjust visualization dimensions if needed.
  // For now, rely on the min(scaleX, scaleY) and hope for the best.

  if (effectiveTotalFabricHeight === 0) {
    return <p>No fabric length calculated. Please check your inputs.</p>;
  }

  return (
    <div className="skirt-2d-visualization">
      <h4>Fabric Layout Visualization</h4>
      <p>Fabric Width: <strong>{fabricWidth.toFixed(2)} cm</strong></p>
      <p>Required Fabric Length: <strong>{totalFabricHeight.toFixed(2)} cm</strong></p>
      <p>Cut Allowance between panels: {cutAllowance.toFixed(2)} cm</p>
      <p>Layout Strategy: Panels are laid out side-by-side, alternating direction for efficient use of fabric.</p>
      <p>Debug: totalFabricHeight={totalFabricHeight.toFixed(2)}, effectiveTotalFabricHeight={effectiveTotalFabricHeight.toFixed(2)}, scale={scale.toFixed(2)}, scaledFabricWidth={scaledFabricWidth.toFixed(2)}, scaledTotalFabricHeight={scaledTotalFabricHeight.toFixed(2)}</p>

      <svg
        width={visualizationWidth}
        height={visualizationHeight}
        viewBox={`0 0 ${visualizationWidth} ${visualizationHeight}`}
        style={{ border: '1px solid #ccc', backgroundColor: '#f9f9f9' }}
      >
        {/* Fabric boundary */}
        <rect
          x={padding}
          y={padding}
          width={scaledFabricWidth}
          height={scaledTotalFabricHeight}
          fill="#e0e0e0"
          stroke="#333"
          strokeWidth="1"
        />
        <text x={padding + scaledFabricWidth / 2} y={padding - 5} textAnchor="middle" fontSize="12" fill="#333">
          {fabricWidth.toFixed(2)} cm (Fabric Width)
        </text>
        <text x={padding - 5} y={padding + scaledTotalFabricHeight / 2} textAnchor="end" fontSize="12" fill="#333" transform={`rotate(-90 ${padding - 5} ${padding + scaledTotalFabricHeight / 2})`}>
          {totalFabricHeight.toFixed(2)} cm (Required Length)
        </text>

        {/* Render panels */}
        {rows.map((row) => row.map((item) => {
          const panel = item.panel;
          const x = padding + item.x * scale;
          const y = padding + item.y * scale;

          const waistWidthScaled = panel.waistWidthWithSeam * scale;
          const hemWidthScaled = panel.hemWidthWithSeam * scale;
          const heightScaled = panel.heightWithSeam * scale;

          let points = '';
          let transform = `translate(${x}, ${y})`;
          let textXOffset = 0;
          let textYOffset = 0;

          if (item.rotated) {
            // For 180-degree rotation (upside down) around the center of the panel:
            // Define points for an upright trapezoid, relative to its own (0,0)
            const maxPanelWidthScaled = Math.max(waistWidthScaled, hemWidthScaled);
            const topX1 = (maxPanelWidthScaled - waistWidthScaled) / 2;
            const topX2 = topX1 + waistWidthScaled;
            const bottomX1 = (maxPanelWidthScaled - hemWidthScaled) / 2;
            const bottomX2 = bottomX1 + hemWidthScaled;

            points = `
              ${topX1},0
              ${topX2},0
              ${bottomX2},${heightScaled}
              ${bottomX1},${heightScaled}
            `;

            // Transform: translate to center, rotate 180 degrees, then translate back to top-left
            transform = `translate(${x + maxPanelWidthScaled / 2}, ${y + heightScaled / 2}) rotate(180) translate(${-maxPanelWidthScaled / 2}, ${-heightScaled / 2})`;

            // Text position for rotated panel (relative to its own coordinate system)
            textXOffset = maxPanelWidthScaled / 2;
            textYOffset = heightScaled / 2;

          } else {
            // Normal orientation
            const maxPanelWidthScaled = Math.max(waistWidthScaled, hemWidthScaled);
            const topX1 = (maxPanelWidthScaled - waistWidthScaled) / 2;
            const topX2 = topX1 + waistWidthScaled;
            const bottomX1 = (maxPanelWidthScaled - hemWidthScaled) / 2;
            const bottomX2 = bottomX1 + hemWidthScaled;

            points = `
              ${topX1},0
              ${topX2},0
              ${bottomX2},${heightScaled}
              ${bottomX1},${heightScaled}
            `;

            transform = `translate(${x}, ${y})`;

            // Text position for normal panel (relative to its own coordinate system)
            textXOffset = maxPanelWidthScaled / 2;
            textYOffset = heightScaled / 2;
          }

          return (
            <g key={panel.id} transform={transform}>
              <polygon
                points={points}
                fill={`hsl(${panel.id * 45}, 70%, 70%)`} // Dynamic color
                stroke="#555"
                strokeWidth="0.5"
              />
              <text x={textXOffset} y={textYOffset} textAnchor="middle" fontSize="8" fill="#333">
                P{panel.id}
              </text>
            </g>
          );
        }))}
      </svg>
    </div>
  );
};

export default Skirt2DVisualization;