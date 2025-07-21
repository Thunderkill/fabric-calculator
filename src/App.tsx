import { useState } from "react";
import FabricCalculator from "./components/FabricCalculator";
import AlineSkirtCalculator from "./components/AlineSkirtCalculator";
import "./App.css"; // Assuming App.css will be used for basic styling

function App() {
  const [selectedCalculator, setSelectedCalculator] = useState<"fabric" | "aline">("fabric");

  return (
    <div className="App">
      <header className="App-header">
        <h1>Fabric & Skirt Calculator</h1>
        <nav className="calculator-tabs">
          <button
            className={selectedCalculator === "fabric" ? "tab-button active" : "tab-button"}
            onClick={() => setSelectedCalculator("fabric")}
          >
            Fabric Cut Calculator
          </button>
          <button
            className={selectedCalculator === "aline" ? "tab-button active" : "tab-button"}
            onClick={() => setSelectedCalculator("aline")}
          >
            A-Line Skirt Panel Calculator
          </button>
        </nav>
      </header>
      <main className="App-main">
        {selectedCalculator === "fabric" && <FabricCalculator />}
        {selectedCalculator === "aline" && <AlineSkirtCalculator />}
      </main>
    </div>
  );
}

export default App;
