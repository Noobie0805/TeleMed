import React, { useState } from 'react';
import HeroSection from '../components/DashboardElements/HeroSection';
import FeaturesOverview from '../components/DashboardElements/FeaturesOverview';
import HowItWorks from '../components/DashboardElements/HowItWorks';
// import SymptomInput from '../components/AssistantElements/SymptomInput';
// import AIResponseDisplay from '../components/AssistantElements/AIResponseDisplay';
// import Disclaimer from '../components/AssistantElements/Disclaimer';
// import Testimonials from '../components/AssistantElements/Testimonials';
import LiveChatWidget from '../components/DashboardElements/LiveChatWidget';
import FAQSection from '../components/DashboardElements/FAQSection';
import UserStats from '../components/DashboardElements/userCharts/UserStats';

function Home() {
  const [aiResponse, setAiResponse] = useState('');

  // Stub: Replace with real API call later
  const handleSymptomSubmit = (symptoms) => {
    setAiResponse('This is a sample AI response based on your symptoms: ' + symptoms);
  };

  return (
    <>
      <div style={{ marginBottom: '6rem' }}><HeroSection /></div>
      <div style={{ marginBottom: '6rem' }}><FeaturesOverview /></div>    
      <div style={{ marginBottom: '6rem' }}><UserStats /></div>
      <div style={{ marginBottom: '6rem' }}><HowItWorks /></div>
      {/* <div style={{ marginBottom: '5rem' }}><SymptomInput onSubmit={handleSymptomSubmit} /></div> */}
      {/* <div style={{ marginBottom: '5rem' }}><AIResponseDisplay response={aiResponse} /></div> */}
      {/* <div style={{ marginBottom: '5rem' }}><Disclaimer /></div> */}
      {/* <div style={{ marginBottom: '5rem' }}><Testimonials /></div> */}
      <FAQSection />
      <LiveChatWidget />
    </>
  );
}

export default Home; 