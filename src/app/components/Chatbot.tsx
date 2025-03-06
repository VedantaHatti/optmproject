"use client";

import React, { useState, useRef, useEffect, FormEvent, ChangeEvent } from 'react';
import { FaSun, FaMoon, FaPaperPlane, FaArrowLeft } from 'react-icons/fa';
import Image from 'next/image';

// Define interface for message structure
interface Message {
  text: string;
  sender: 'user' | 'bot';
  isTyping?: boolean;
}

// Define interface for form data
interface FormData {
  email: string;
  businessName: string;
  businessOffer: string;
  feedback: string;
  jobRole: string;
  jobInterest: string;
  formType: string;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hi, I am OPTM Media Solutions virtual assistant", sender: 'bot' }
  ]);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [showBusinessForm, setShowBusinessForm] = useState<boolean>(false);
  const [showJobForm, setShowJobForm] = useState<boolean>(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState<boolean>(false);
  const [showNewChatButton, setShowNewChatButton] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    businessName: '',
    businessOffer: '',
    feedback: '',
    jobRole: '',
    jobInterest: '',
    formType: ''
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [userInput, setUserInput] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (text: string, sender: 'user' | 'bot') => {
    if (sender === 'bot') {
      setIsTyping(true);
      
      // Split message into individual characters
      const characters = text.split('');
      let currentText = '';
      let charIndex = 0;
      
      // Create a temporary message for the typing animation
      setMessages(prev => [...prev, { text: '', sender: 'bot', isTyping: true }]);
      
      // Animate typing one character at a time
      const typingInterval = setInterval(() => {
        if (charIndex < characters.length) {
          currentText += characters[charIndex];
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { 
              text: currentText, 
              sender: 'bot',
              isTyping: true 
            };
            return newMessages;
          });
          charIndex++;
        } else {
          clearInterval(typingInterval);
          // Replace the temporary message with the final message
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { 
              text, 
              sender: 'bot',
              isTyping: false 
            };
            return newMessages;
          });
          setIsTyping(false);
        }
      }, 25); // Adjust speed of typing here
    } else {
      // User messages appear instantly
      setMessages(prev => [...prev, { text, sender }]);
    }
  };

  const handleUserInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleUserGreeting = () => {
    if (userInput.trim() === "") return;
    addMessage(userInput, 'user');
    setUserInput("");
    
    setTimeout(() => {
      addMessage('Hi, what are you here for?', 'bot');
      setTimeout(() => {
        setShowOptions(true);
        setShowNewChatButton(false);
      }, 1000);
    }, 500);
  };

  const handleOptionSelect = (option: string) => {
    addMessage(option, 'user');
    
    setTimeout(() => {
      if (option === 'Business Offer') {
        setShowBusinessForm(true);
        setShowJobForm(false);
        setShowFeedbackForm(false);
        setFormData(prev => ({ ...prev, formType: 'business' }));
        addMessage('Please fill in your details below:', 'bot');
      } else if (option === 'Job/Internship Opportunities') {
        setShowJobForm(true);
        setShowBusinessForm(false);
        setShowFeedbackForm(false);
        setFormData(prev => ({ ...prev, formType: 'job' }));
        addMessage('Please provide your details and the role you are looking for:', 'bot');
      } else if (option === 'Feedback') {
        setShowFeedbackForm(true);
        setShowBusinessForm(false);
        setShowJobForm(false);
        setFormData(prev => ({ ...prev, formType: 'feedback' }));
        addMessage('Please provide your feedback:', 'bot');
      }
    }, 500);
    
    setShowOptions(false);
  };

  const handleChangeOption = () => {
    // Add a message to indicate the change
    addMessage('I want to change my option', 'user');
    
    // Reset all form states and data
    setShowBusinessForm(false);
    setShowJobForm(false);
    setShowFeedbackForm(false);
    setFormData({
      email: '',
      businessName: '',
      businessOffer: '',
      feedback: '',
      jobRole: '',
      jobInterest: '',
      formType: ''
    });
    
    // Show bot message and options again
    setTimeout(() => {
      addMessage('Sure, what would you like to do instead?', 'bot');
      setTimeout(() => {
        setShowOptions(true);
      }, 1000);
    }, 500);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Identify form type
    const formType = showBusinessForm
      ? 'business'
      : showJobForm
      ? 'job'
      : showFeedbackForm
      ? 'feedback'
      : '';

    // Prepare data based on form type
    const submissionData = {
      formType,
      email: formData.email,
      businessName: showBusinessForm ? formData.businessName : undefined,
      businessOffer: showBusinessForm ? formData.businessOffer : undefined,
      jobRole: showJobForm ? formData.jobRole : undefined,
      jobInterest: showJobForm ? formData.jobInterest : undefined,
      feedback: showFeedbackForm ? formData.feedback : undefined,
    };

    try {
      const response = await fetch('/api/submit-business-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        addMessage('Thank you! Your submission has been received. Our team will get back to you shortly.', 'bot');
        setTimeout(() => {
          addMessage('Would you like to start a new chat?', 'bot');
          setShowNewChatButton(true);
        }, 2000);
        
        // Reset form state
        setShowBusinessForm(false);
        setShowJobForm(false);
        setShowFeedbackForm(false);
        setFormData({ email: '', businessName: '', businessOffer: '', feedback: '', jobRole: '', jobInterest: '', formType: '' });
      } else {
        addMessage('Sorry, there was an error submitting your information. Please try again later.', 'bot');
        setShowNewChatButton(true);
      }
    } catch (error) {
      addMessage('Sorry, there was an error submitting your information. Please try again later.', 'bot');
      setShowNewChatButton(true);
    }

    setIsSubmitting(false);
  };

  const handleStartNewChat = () => {
    addMessage('Start a new chat', 'user');
    setTimeout(() => {
      addMessage('Hi, what are you here for?', 'bot');
      setTimeout(() => {
        setShowOptions(true);
        setShowNewChatButton(false);
      }, 1000);
    }, 500);
  };

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className={`max-w-md mx-auto rounded-lg shadow-2xl overflow-hidden transition-all duration-300 ${theme === 'light' ? 'bg-white' : 'bg-gray-800 text-white'} transform hover:scale-[1.01]`}>
      {/* Chat Header with Logo */}
      <div className={`flex items-center p-4 border-b ${theme === 'light' ? 'bg-gradient-to-r from-blue-900 to-blue-400 text-white' : 'bg-gradient-to-r from-gray-900 to-blue-900 text-white'}`}>
        <div className="flex-shrink-0 mr-3">
          <Image 
            src="/optm-logo.png" // Update this with the actual path to your logo
            alt="OPTM Logo"
            width={40}
            height={40}
            className="rounded-full bg-white p-1" // Added padding and background for logo visibility
          />
        </div>
        <div>
          <h3 className="font-bold">OPTM Media Solutions</h3>
          <p className="text-sm opacity-80">Virtual Assistant</p>
        </div>
        {/* Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className="ml-auto text-xl p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          {theme === 'light' ? <FaMoon /> : <FaSun />}
        </button>
      </div>

      {/* Chat Content */}
      <div className={`h-96 overflow-y-auto p-4 ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-700'}`}>
        {/* Messages */}
        <div className="space-y-3">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`p-3 rounded-lg max-w-[80%] ${
                  message.sender === 'bot' 
                    ? `${theme === 'light' ? 'bg-blue-100 text-blue-900' : 'bg-blue-900 text-white'} shadow-md` 
                    : `${theme === 'light' ? 'bg-gray-200 text-gray-900' : 'bg-gray-600 text-white'} shadow-md`
                } transition-all duration-200 ${message.isTyping ? 'animate-pulse' : ''}`}
              >
                {message.text}
                {message.isTyping && (
                  <span className="inline-block ml-1 w-1 h-5">
                    <span className="typing-cursor">|</span>
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input Area */}
      <div className={`p-4 border-t ${theme === 'light' ? 'bg-white' : 'bg-gray-800'}`}>
        {/* New Chat Button */}
        {showNewChatButton && (
          <div className="mb-4">
            <button
              onClick={handleStartNewChat}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md font-medium transform hover:scale-[1.02]"
            >
              Start a new chat
            </button>
          </div>
        )}

        {/* Options */}
        {showOptions && !showBusinessForm && !showJobForm && !showFeedbackForm && (
          <div className="space-y-2 mb-4">
            {['Business Offer', 'Job/Internship Opportunities', 'Feedback'].map((option) => (
              <button
                key={option}
                onClick={() => handleOptionSelect(option)}
                className={`w-full ${theme === 'light' ? 'bg-white hover:bg-gray-50' : 'bg-gray-700 hover:bg-gray-600'} border ${theme === 'light' ? 'border-gray-300' : 'border-gray-600'} py-3 px-4 rounded-lg transition-all shadow-md font-medium transform hover:scale-[1.02] hover:shadow-lg`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {/* Change Option Button - Shown when any form is displayed */}
        {(showBusinessForm || showJobForm || showFeedbackForm) && (
          <div className="mb-4">
            <button
              onClick={handleChangeOption}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${theme === 'light' ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
            >
              <FaArrowLeft />
              <span>Change Option</span>
            </button>
          </div>
        )}

        {/* Business Form */}
        {showBusinessForm && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'light' ? 'border-gray-300 bg-white' : 'border-gray-600 bg-gray-700 text-white'} transition-all`}
            />
            <input
              placeholder="Business Name"
              value={formData.businessName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
              required
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'light' ? 'border-gray-300 bg-white' : 'border-gray-600 bg-gray-700 text-white'} transition-all`}
            />
            <textarea
              placeholder="Describe your business offer"
              value={formData.businessOffer}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, businessOffer: e.target.value }))}
              required
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 ${theme === 'light' ? 'border-gray-300 bg-white' : 'border-gray-600 bg-gray-700 text-white'} transition-all`}
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md font-medium disabled:opacity-70 transform hover:scale-[1.02]"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        )}

        {/* Job/Internship Form */}
        {showJobForm && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'light' ? 'border-gray-300 bg-white' : 'border-gray-600 bg-gray-700 text-white'} transition-all`}
            />
            <input
              placeholder="Job Role"
              value={formData.jobRole}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, jobRole: e.target.value }))}
              required
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'light' ? 'border-gray-300 bg-white' : 'border-gray-600 bg-gray-700 text-white'} transition-all`}
            />
            <textarea
              placeholder="Describe your job interest"
              value={formData.jobInterest}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, jobInterest: e.target.value }))}
              required
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 ${theme === 'light' ? 'border-gray-300 bg-white' : 'border-gray-600 bg-gray-700 text-white'} transition-all`}
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md font-medium disabled:opacity-70 transform hover:scale-[1.02]"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        )}

        {/* Feedback Form */}
        {showFeedbackForm && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'light' ? 'border-gray-300 bg-white' : 'border-gray-600 bg-gray-700 text-white'} transition-all`}
            />
            <textarea
              placeholder="Please provide your feedback"
              value={formData.feedback}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, feedback: e.target.value }))}
              required
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 ${theme === 'light' ? 'border-gray-300 bg-white' : 'border-gray-600 bg-gray-700 text-white'} transition-all`}
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md font-medium disabled:opacity-70 transform hover:scale-[1.02]"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        )}

        {/* User Input Field */}
        {!showBusinessForm && !showJobForm && !showFeedbackForm && !showNewChatButton && (
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Type your message..."
              value={userInput}
              onChange={handleUserInputChange}
              onKeyDown={(e) => e.key === 'Enter' && handleUserGreeting()}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'light' ? 'border-gray-300 bg-white' : 'border-gray-600 bg-gray-700 text-white'} transition-all`}
            />
            <button 
              onClick={handleUserGreeting}
              disabled={!userInput.trim() || isTyping}
              className={`ml-2 p-3 rounded-full ${userInput.trim() && !isTyping ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500'} transition-all shadow-md transform hover:scale-110`}
            >
              <FaPaperPlane />
            </button>
          </div>
        )}
      </div>

      {/* Add CSS for typing animation */}
      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .typing-cursor {
          animation: blink 0.7s infinite;
        }
      `}</style>
    </div>
  );
};

export default Chatbot;
