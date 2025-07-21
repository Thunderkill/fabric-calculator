import React, { useState } from 'react';

const FabricCalculator: React.FC = () => {
  const [fabricLength, setFabricLength] = useState<number | ''>('');
  const [wantedLength, setWantedLength] = useState<number | ''>('');
  const [result, setResult] = useState<string | null>(null);

  const calculateCuts = () => {
    if (fabricLength === '' || wantedLength === '' || fabricLength <= 0 || wantedLength <= 0) {
      setResult('Please enter valid positive numbers for both lengths.');
      return;
    }

    const numFabricLength = Number(fabricLength);
    const numWantedLength = Number(wantedLength);

    const cuts = numWantedLength / numFabricLength;
    const fullCuts = Math.floor(cuts);
    const remainingLength = numWantedLength % numFabricLength;

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

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '600px', margin: 'auto', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>Fabric Cut Calculator</h2>
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="fabricLength" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Available Fabric Length (cm):
        </label>
        <input
          type="number"
          id="fabricLength"
          value={fabricLength}
          onChange={(e) => setFabricLength(Number(e.target.value))}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
        />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="wantedLength" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Wanted Fabric Length (cm):
        </label>
        <input
          type="number"
          id="wantedLength"
          value={wantedLength}
          onChange={(e) => setWantedLength(Number(e.target.value))}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
        />
      </div>
      <button
        onClick={calculateCuts}
        style={{
          width: '100%',
          padding: '10px 15px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Calculate Cuts
      </button>
      {result && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f8ff', border: '1px solid #b0e0e6', borderRadius: '4px' }}>
          <h3 style={{ color: '#0056b3', marginBottom: '10px' }}>Result:</h3>
          <p style={{ margin: '0', lineHeight: '1.5' }}>{result}</p>
        </div>
      )}
    </div>
  );
};

export default FabricCalculator;