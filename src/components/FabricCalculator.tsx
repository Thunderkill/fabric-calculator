import React, { useState } from 'react';

const FabricCalculator: React.FC = () => {
  const [fabricLength, setFabricLength] = useState<number | ''>('');
  const [wantedLength, setWantedLength] = useState<number | ''>('');
  const [seamAllowance, setSeamAllowance] = useState<number>(0); // New state for seam allowance
  const [result, setResult] = useState<string | null>(null);

  const calculateCuts = () => {
    if (fabricLength === '' || wantedLength === '' || fabricLength <= 0 || wantedLength <= 0) {
      setResult('Please enter valid positive numbers for both lengths.');
      return;
    }

    const numFabricLength = Number(fabricLength);
    const numWantedLength = Number(wantedLength);
    const totalWantedLength = numWantedLength + (seamAllowance * 2); // Add seam allowance to both sides

    const cuts = totalWantedLength / numFabricLength;
    const fullCuts = Math.floor(cuts);
    const remainingLength = totalWantedLength % numFabricLength;

    let explanation = `You need to cut the main fabric ${cuts.toFixed(2)} times.`;

    if (fullCuts > 0) {
      explanation += ` Meaning, you will have ${fullCuts} piece(s) of ${numFabricLength}cm.`;
    }

    if (remainingLength > 0) {
      explanation += ` And the final piece will be ${remainingLength.toFixed(2)}cm.`;
    } else if (fullCuts > 0 && remainingLength === 0) {
      explanation += ` All pieces will be ${numFabricLength}cm.`;
    }

    setResult(explanation);
  };

  const renderFabricVisualization = () => {
    if (!result || fabricLength === '' || wantedLength === '') return null;

    const numFabricLength = Number(fabricLength);
    const numWantedLength = Number(wantedLength);
    const totalWantedLength = numWantedLength + (seamAllowance * 2); // Use total wanted length for visualization

    if (numFabricLength <= 0 || totalWantedLength <= 0) return null;

    const fullCuts = Math.floor(totalWantedLength / numFabricLength);
    const remaining = totalWantedLength % numFabricLength;

    const pieces = [];
    for (let i = 0; i < fullCuts; i++) {
      pieces.push(
        <div key={`full-${i}`} className="fabric-piece" style={{ width: `${Math.min(numFabricLength, 100)}px` }}>
          {numFabricLength}cm
        </div>
      );
    }

    if (remaining > 0) {
      pieces.push(
        <div key="remaining" className="fabric-piece remaining" style={{ width: `${Math.min(remaining, 100)}px` }}>
          {remaining.toFixed(2)}cm
        </div>
      );
    }

    return (
      <div className="fabric-visualization">
        {pieces}
      </div>
    );
  };

  return (
    <div className="calculator-container">
      <h2 className="calculator-title">Fabric Cut Calculator</h2>
      <div className="input-group">
        <label htmlFor="fabricLength" className="input-label">
          Available Fabric Length (cm):
        </label>
        <input
          type="number"
          id="fabricLength"
          value={fabricLength}
          onChange={(e) => setFabricLength(Number(e.target.value))}
          className="input-field"
        />
      </div>
      <div className="input-group">
        <label htmlFor="wantedLength" className="input-label">
          Wanted Fabric Length (cm):
        </label>
        <input
          type="number"
          id="wantedLength"
          value={wantedLength}
          onChange={(e) => setWantedLength(Number(e.target.value))}
          className="input-field"
        />
      </div>
      <div className="input-group">
        <label htmlFor="seamAllowance" className="input-label">
          Seam Allowance (cm per side):
        </label>
        <input
          type="number"
          id="seamAllowance"
          value={seamAllowance}
          onChange={(e) => setSeamAllowance(Number(e.target.value))}
          className="input-field"
        />
      </div>
      <button onClick={calculateCuts} className="calculate-button">
        Calculate Cuts
      </button>
      {result && (
        <div className="result-container">
          <h3 className="result-title">Result:</h3>
          <p className="result-text">{result}</p>
          {renderFabricVisualization()}
        </div>
      )}
    </div>
  );
};

export default FabricCalculator;