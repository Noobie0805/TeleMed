import React from 'react'
import SymptomInput from '../components/AssistantElements/SymptomInput'
import AIResponseDisplay from '../components/AssistantElements/AIResponseDisplay'
import Disclaimer from '../components/AssistantElements/Disclaimer'

const Assistant = () => {
    return (
        <div>
            <div><SymptomInput /></div>
            <div><AIResponseDisplay /></div>
            <div><Disclaimer /></div>
        </div>
    )
}

export default Assistant