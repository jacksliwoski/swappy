import { useState } from 'react';
import VisionForm from './components/VisionForm';
import FactsCard from './components/FactsCard';
import ValuationCard from './components/ValuationCard';
import FairnessTester from './components/FairnessTester';
import StreamModerationTester from './components/StreamModerationTester';
import MeetupSuggestions from './components/MeetupSuggestions';
import { Facts, ValuationResponse } from './types';

function App() {
  const [facts, setFacts] = useState<Facts | null>(null);
  const [valuation, setValuation] = useState<ValuationResponse | null>(null);
  const [sideA, setSideA] = useState<number[]>([]);
  const [sideB, setSideB] = useState<number[]>([]);

  const handleFactsExtracted = (extractedFacts: Facts) => {
    setFacts(extractedFacts);
    setValuation(null);
  };

  const handleValuationReceived = (val: ValuationResponse) => {
    setValuation(val);
  };

  const handleAddToSide = (value: number, side: 'A' | 'B') => {
    if (side === 'A') {
      setSideA([...sideA, value]);
    } else {
      setSideB([...sideB, value]);
    }
  };

  return (
    <div>
      <header style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Swappy AI - Local MVP</h1>
        <p style={{ color: '#666' }}>Test AI-powered barter trade features</p>
      </header>

      <VisionForm onFactsExtracted={handleFactsExtracted} />

      {facts && (
        <FactsCard
          facts={facts}
          onFactsUpdated={setFacts}
        />
      )}

      {facts && (
        <ValuationCard
          facts={facts}
          valuation={valuation}
          onValuationReceived={handleValuationReceived}
          onAddToSide={handleAddToSide}
        />
      )}

      <FairnessTester
        sideA={sideA}
        sideB={sideB}
        onUpdateSideA={setSideA}
        onUpdateSideB={setSideB}
      />

      <StreamModerationTester />

      <MeetupSuggestions />
    </div>
  );
}

export default App;
