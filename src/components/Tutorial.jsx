import { useState, useEffect } from 'react';
import './Tutorial.css';

const tutorialSteps = [
    {
        target: '.flow-container',
        title: 'Welcome to DSP Family Trees',
        content: 'Welcome to a new way to explore our DSP family history. Our rich traditions and connections deserved far better than google sheets could offer. Use this interactive tool to discover and explore our family lineages.',
        position: 'center'
    },
    {
        target: '.control-panel',
        title: 'Control Panel',
        content: 'Use these controls to filter and organize the family tree.',
        position: 'left'
    },
    {
        target: 'a[href="/search"]',
        title: 'Quick Search',
        content: 'Click here to access the dedicated search page for finding any member quickly.',
        position: 'bottom'
    },
    {
        target: 'select',
        title: 'House Filter',
        content: 'Filter members by their house to focus on specific lineages.',
        position: 'top'
    },
    {
        target: '.react-flow__node',
        title: 'Family Members',
        content: 'Click on any member to see their details, including bigs, littles, and siblings.',
        position: 'right'
    },
    {
        target: '.react-flow__controls',
        title: 'Navigation',
        content: 'Use these controls to zoom and pan around the tree.',
        position: 'right'
    }
];

const Tutorial = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        // Handle window resize
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);

        // Only show tutorial if user hasn't seen it AND not on mobile
        const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
        if (!hasSeenTutorial && !isMobile) {
            setIsVisible(true);
        }

        return () => window.removeEventListener('resize', handleResize);
    }, [isMobile]);

    // If on mobile, don't render anything
    if (isMobile) {
        return null;
    }

    const handleNext = () => {
        if (currentStep < tutorialSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        localStorage.setItem('hasSeenTutorial', 'true');
        setIsVisible(false);
        onComplete?.();
    };

    if (!isVisible) return null;

    const step = tutorialSteps[currentStep];
    const targetElement = document.querySelector(step.target);
    const rect = targetElement?.getBoundingClientRect() || {};

    return (
        <div className="tutorial-overlay">
            {currentStep === 0 ? (
                <div
                    className="tutorial-content welcome-message"
                    style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '400px',
                        textAlign: 'center',
                        background: 'white',
                        padding: '30px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <h3>{tutorialSteps[0].title}</h3>
                    <p>{tutorialSteps[0].content}</p>
                    <div className="tutorial-actions">
                        <button onClick={handleComplete}>Skip Tutorial</button>
                        <button onClick={handleNext}>Start Tour</button>
                    </div>
                    <div className="tutorial-progress">
                        {currentStep + 1} of {tutorialSteps.length}
                    </div>
                </div>
            ) : (
                <>
                    <div
                        className="tutorial-highlight"
                        style={{
                            top: rect.top - 4,
                            left: rect.left - 4,
                            width: rect.width + 8,
                            height: rect.height + 8
                        }}
                    />
                    <div
                        className="tutorial-content"
                        style={{
                            [step.position]: `${rect[step.position] + 20}px`,
                            left: step.position === 'left' ? rect.left - 320 : rect.left
                        }}
                    >
                        <h3>{step.title}</h3>
                        <p>{step.content}</p>
                        <div className="tutorial-actions">
                            <button onClick={handleComplete}>Skip Tutorial</button>
                            <button onClick={handleNext}>
                                {currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
                            </button>
                        </div>
                        <div className="tutorial-progress">
                            {currentStep + 1} of {tutorialSteps.length}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Tutorial; 