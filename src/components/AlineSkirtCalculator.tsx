import React, { useState, useEffect, useRef, useCallback } from 'react';

interface PanelDimensions {
  id: number;
  waistWidth: number;
  hemWidth: number;
  height: number;
  waistWidthWithSeam: number;
  hemWidthWithSeam: number;
  heightWithSeam: number;
}

// Calculate individual panel widths based on knob positions
const getPanelWidths = (totalCircumference: number, knobPositions: number[], count: number) => {
  const widths: number[] = [];
  let prevPos = 0;
  for (let i = 0; i < count - 1; i++) {
    const currentPos = knobPositions[i];
    widths.push((currentPos - prevPos) * totalCircumference);
    prevPos = currentPos;
  }
  widths.push((1 - prevPos) * totalCircumference); // Last panel
  return widths;
};

const Slider: React.FC<{
  label: string;
  totalCircumference: number | '';
  knobPositions: number[];
  setKnobPositions: React.Dispatch<React.SetStateAction<number[]>>;
  panelCount: number;
}> = ({ label, totalCircumference, knobPositions, setKnobPositions, panelCount }) => {
  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const [activeKnobIndex, setActiveKnobIndex] = useState<number | null>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (activeKnobIndex === null || !sliderTrackRef.current) return;

    e.preventDefault(); // Prevent default browser behavior like text selection

    const rect = sliderTrackRef.current.getBoundingClientRect();
    const newRelativePos = (e.clientX - rect.left) / rect.width;

    setKnobPositions(prevPositions => {
      const newPositions = [...prevPositions];
      newPositions[activeKnobIndex] = Math.max(
        activeKnobIndex === 0 ? 0 : newPositions[activeKnobIndex - 1],
        Math.min(
          activeKnobIndex === panelCount - 2 ? 1 : (newPositions[activeKnobIndex + 1] || 1),
          newRelativePos
        )
      );
      return newPositions.sort((a, b) => a - b);
    });
  }, [activeKnobIndex, panelCount, setKnobPositions]);

  const handleMouseUp = useCallback(() => {
    setActiveKnobIndex(null);
  }, []);

  useEffect(() => {
    if (activeKnobIndex !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeKnobIndex, handleMouseMove, handleMouseUp]);

  if (totalCircumference === '' || totalCircumference <= 0 || panelCount <= 1) return null;

  const numTotalCircumference = Number(totalCircumference);

  return (
    <div className="slider-group">
      <label className="input-label">{label} Panel Widths:</label>
      <div
        className="slider-track"
        ref={sliderTrackRef}
        style={{ width: '100%', height: '20px', background: '#ddd', position: 'relative' }}
      >
        {knobPositions.map((pos: number, index: number) => (
          <div
            key={index}
            className="slider-knob"
            style={{
              left: `${pos * 100}%`,
              position: 'absolute',
              top: '50%',
              width: '20px',
              height: '20px',
              background: 'blue',
              cursor: 'ew-resize',
              transform: 'translate(-50%, -50%)',
            }}
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent default drag behavior
              setActiveKnobIndex(index);
            }}
          ></div>
        ))}
      </div>
      <div className="panel-width-display">
        {getPanelWidths(numTotalCircumference, knobPositions, panelCount).map((width: number, index: number) => (
          <span key={index} style={{ marginRight: '10px' }}>
            Panel {index + 1}: {width.toFixed(2)}cm
          </span>
        ))}
      </div>
    </div>
  );
};


const AlineSkirtCalculator: React.FC = () => {
  const [waistCircumference, setWaistCircumference] = useState<number | ''>('');
  const [hemCircumference, setHemCircumference] = useState<number | ''>('');
  const [panelCount, setPanelCount] = useState<number>(4); // Default to 4 panels
  const [skirtLength, setSkirtLength] = useState<number | ''>('');
  const [waistSeamAllowance, setWaistSeamAllowance] = useState<number>(0);
  const [sideSeamAllowance, setSideSeamAllowance] = useState<number>(0);
  const [hemSeamAllowance, setHemSeamAllowance] = useState<number>(0);

  // State for slider knob positions (normalized 0-1, relative to total circumference)
  // For N panels, there are N-1 knobs.
  const [waistKnobPositions, setWaistKnobPositions] = useState<number[]>([]);
  const [hemKnobPositions, setHemKnobPositions] = useState<number[]>([]);

  const [calculatedPanels, setCalculatedPanels] = useState<PanelDimensions[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize knob positions when panelCount changes
  useEffect(() => {
    if (panelCount > 1) {
      const initialKnobs = Array.from({ length: panelCount - 1 }, (_, i) => (i + 1) / panelCount);
      setWaistKnobPositions(initialKnobs);
      setHemKnobPositions(initialKnobs);
    } else {
      setWaistKnobPositions([]);
      setHemKnobPositions([]);
    }
  }, [panelCount]);

  const calculatePanels = () => {
    setError(null);
    if (
      waistCircumference === '' || hemCircumference === '' || skirtLength === '' ||
      waistCircumference <= 0 || hemCircumference <= 0 || skirtLength <= 0 ||
      panelCount <= 0
    ) {
      setError('Please enter valid positive numbers for all main inputs.');
      setCalculatedPanels(null);
      return;
    }

    const numWaist = Number(waistCircumference);
    const numHem = Number(hemCircumference);
    const numSkirtLength = Number(skirtLength);

    const panels: PanelDimensions[] = [];

    const waistPanelWidths = getPanelWidths(numWaist, waistKnobPositions, panelCount);
    const hemPanelWidths = getPanelWidths(numHem, hemKnobPositions, panelCount);

    for (let i = 0; i < panelCount; i++) {
      const panelWaistWidth = waistPanelWidths[i];
      const panelHemWidth = hemPanelWidths[i];

      // Add seam allowances
      const panelWaistWidthWithSeam = panelWaistWidth + (sideSeamAllowance * 2);
      const panelHemWidthWithSeam = panelHemWidth + (sideSeamAllowance * 2);
      const panelHeightWithSeam = numSkirtLength + waistSeamAllowance + hemSeamAllowance;

      panels.push({
        id: i + 1,
        waistWidth: panelWaistWidth,
        hemWidth: panelHemWidth,
        height: numSkirtLength,
        waistWidthWithSeam: panelWaistWidthWithSeam,
        hemWidthWithSeam: panelHemWidthWithSeam,
        heightWithSeam: panelHeightWithSeam,
      });
    }
    setCalculatedPanels(panels);
  };

  const renderPanelVisualization = () => {
    if (!calculatedPanels || calculatedPanels.length === 0) return null;

    const maxPanelWidth = Math.max(...calculatedPanels.map(p => Math.max(p.waistWidthWithSeam, p.hemWidthWithSeam)));
    const scaleFactor = 100 / maxPanelWidth; // Scale to fit within 100px width for visualization

    return (
      <div className="panel-visualization-container">
        <h3>Calculated Panels:</h3>
        <div className="panels-grid">
          {calculatedPanels.map(panel => (
            <div key={panel.id} className="panel-card">
              <h4>Panel {panel.id}</h4>
              <svg
                width="150"
                height={panel.heightWithSeam * scaleFactor}
                viewBox={`0 0 150 ${panel.heightWithSeam * scaleFactor}`}
                className="panel-svg"
              >
                {/* Draw trapezoid */}
                <polygon
                  points={`
                    ${(150 - (panel.waistWidthWithSeam * scaleFactor)) / 2},0
                    ${(150 + (panel.waistWidthWithSeam * scaleFactor)) / 2},0
                    ${(150 + (panel.hemWidthWithSeam * scaleFactor)) / 2},${panel.heightWithSeam * scaleFactor}
                    ${(150 - (panel.hemWidthWithSeam * scaleFactor)) / 2},${panel.heightWithSeam * scaleFactor}
                  `}
                  fill="#ADD8E6"
                  stroke="#333"
                  strokeWidth="1"
                />
                {/* Dimensions */}
                <text x="75" y="15" textAnchor="middle" fontSize="10" fill="#333">
                  W: {panel.waistWidthWithSeam.toFixed(2)}cm
                </text>
                <text x="75" y={panel.heightWithSeam * scaleFactor - 5} textAnchor="middle" fontSize="10" fill="#333">
                  H: {panel.hemWidthWithSeam.toFixed(2)}cm
                </text>
                <text x="10" y={panel.heightWithSeam * scaleFactor / 2} textAnchor="start" fontSize="10" fill="#333" transform={`rotate(-90 10 ${panel.heightWithSeam * scaleFactor / 2})`}>
                  L: {panel.heightWithSeam.toFixed(2)}cm
                </text>
              </svg>
              <p>Waist Width: {panel.waistWidth.toFixed(2)}cm ({panel.waistWidthWithSeam.toFixed(2)}cm with seam)</p>
              <p>Hem Width: {panel.hemWidth.toFixed(2)}cm ({panel.hemWidthWithSeam.toFixed(2)}cm with seam)</p>
              <p>Length: {panel.height.toFixed(2)}cm ({panel.heightWithSeam.toFixed(2)}cm with seam)</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="calculator-container">
      <h2 className="calculator-title">A-Line Skirt Panel Calculator</h2>

      <div className="input-group">
        <label htmlFor="waistCircumference" className="input-label">
          Waist Circumference (cm):
        </label>
        <input
          type="number"
          id="waistCircumference"
          value={waistCircumference}
          onChange={(e) => setWaistCircumference(Number(e.target.value))}
          className="input-field"
        />
      </div>

      <div className="input-group">
        <label htmlFor="hemCircumference" className="input-label">
          Hem Circumference (cm):
        </label>
        <input
          type="number"
          id="hemCircumference"
          value={hemCircumference}
          onChange={(e) => setHemCircumference(Number(e.target.value))}
          className="input-field"
        />
      </div>

      <div className="input-group">
        <label htmlFor="skirtLength" className="input-label">
          Skirt Length (cm):
        </label>
        <input
          type="number"
          id="skirtLength"
          value={skirtLength}
          onChange={(e) => setSkirtLength(Number(e.target.value))}
          className="input-field"
        />
      </div>

      <div className="input-group">
        <label htmlFor="panelCount" className="input-label">
          Number of Panels:
        </label>
        <input
          type="number"
          id="panelCount"
          value={panelCount}
          onChange={(e) => setPanelCount(Math.max(1, Math.floor(Number(e.target.value))))}
          className="input-field"
          min="1"
        />
      </div>

      <Slider
        label="Waist"
        totalCircumference={waistCircumference}
        knobPositions={waistKnobPositions}
        setKnobPositions={setWaistKnobPositions}
        panelCount={panelCount}
      />
      <Slider
        label="Hem"
        totalCircumference={hemCircumference}
        knobPositions={hemKnobPositions}
        setKnobPositions={setHemKnobPositions}
        panelCount={panelCount}
      />

      <div className="input-group">
        <label htmlFor="waistSeamAllowance" className="input-label">
          Waist Seam Allowance (cm):
        </label>
        <input
          type="number"
          id="waistSeamAllowance"
          value={waistSeamAllowance}
          onChange={(e) => setWaistSeamAllowance(Number(e.target.value))}
          className="input-field"
        />
      </div>

      <div className="input-group">
        <label htmlFor="sideSeamAllowance" className="input-label">
          Side Seam Allowance (cm):
        </label>
        <input
          type="number"
          id="sideSeamAllowance"
          value={sideSeamAllowance}
          onChange={(e) => setSideSeamAllowance(Number(e.target.value))}
          className="input-field"
        />
      </div>

      <div className="input-group">
        <label htmlFor="hemSeamAllowance" className="input-label">
          Hem Seam Allowance (cm):
        </label>
        <input
          type="number"
          id="hemSeamAllowance"
          value={hemSeamAllowance}
          onChange={(e) => setHemSeamAllowance(Number(e.target.value))}
          className="input-field"
        />
      </div>

      <button onClick={calculatePanels} className="calculate-button">
        Calculate Panels
      </button>

      {error && <p className="error-message">{error}</p>}

      {calculatedPanels && renderPanelVisualization()}
    </div>
  );
};

export default AlineSkirtCalculator;