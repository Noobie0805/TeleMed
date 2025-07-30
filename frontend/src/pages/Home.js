import React, { useState } from 'react';
import HeroSection from '../components/HeroSection';
import FeaturesOverview from '../components/FeaturesOverview';
import HowItWorks from '../components/HowItWorks';
import SymptomInput from '../components/SymptomInput';
import AIResponseDisplay from '../components/AIResponseDisplay';
import Disclaimer from '../components/Disclaimer';
import Testimonials from '../components/Testimonials';
import LiveChatWidget from '../components/LiveChatWidget';
import FAQSection from '../components/FAQSection';

function Home() {
  const [aiResponse, setAiResponse] = useState('');

  // Stub: Replace with real API call later
  const handleSymptomSubmit = (symptoms) => {
    setAiResponse('This is a sample AI response based on your symptoms: ' + symptoms);
  };

  return (
    <>
      <div style={{ marginBottom: '5rem' }}><HeroSection /></div>
      <div style={{ marginBottom: '5rem' }}><FeaturesOverview /></div>
      <div style={{ marginBottom: '5rem' }}><HowItWorks /></div>
      <div style={{ marginBottom: '5rem' }}><SymptomInput onSubmit={handleSymptomSubmit} /></div>
      <div style={{ marginBottom: '5rem' }}><AIResponseDisplay response={aiResponse} /></div>
      <div style={{ marginBottom: '5rem' }}><Disclaimer /></div>
      <div style={{ marginBottom: '5rem' }}><Testimonials /></div>
      <FAQSection />
      <LiveChatWidget />
    </>
  );
}

export default Home; 