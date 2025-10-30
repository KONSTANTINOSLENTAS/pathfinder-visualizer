import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './Tutorial.css';

const tutorialSteps = [
  {
    title: 'Welcome to Pathfinding Visualizer!',
    content: 'This is an interactive tool to visualize different pathfinding algorithms.'
  },
  {
    title: 'Meet the Nodes',
    content: 'This is the Start Node (Green). You can click and drag it! This is the Finish Node (Red). You can drag this one too!'
  },
  {
    title: 'Drawing Walls',
    content: 'Click and drag on any empty cells to create "walls." The algorithms will have to find a path around them.'
  },
  {
    title: 'Visualize!',
    content: "Once your maze is ready, pick an algorithm (like A*!) and click 'Visualize' to see it find the shortest path."
  },
  {
    title: 'You\'re Ready!',
    content: "Here's a quick demo of it in action. Enjoy!" 
  }
];

export default function Tutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    setIsOpen(false);
  };

  const goToNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const goToPrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const isLastStep = currentStep === tutorialSteps.length - 1;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className="tutorial-modal"
      overlayClassName="tutorial-overlay"
      contentLabel="Tutorial"
    >
      <h2>{tutorialSteps[currentStep].title}</h2>
      <p>{tutorialSteps[currentStep].content}</p>
      
      {}
      {isLastStep && (
        <div className="tutorial-video-container">
          <video
            width="100%"
            loop
            autoPlay
            muted
            playsInline
          >
            <source src="/tutorial-demo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
      {}
      
      <div className="tutorial-navigation">
        <button onClick={goToPrev} disabled={currentStep === 0}>
          Previous
        </button>
        {isLastStep ? (
          <button onClick={handleClose} className="finish-button">
            Finish
          </button>
        ) : (
          <button onClick={goToNext}>
            Next
          </button>
        )}
      </div>
    </Modal>
  );
}