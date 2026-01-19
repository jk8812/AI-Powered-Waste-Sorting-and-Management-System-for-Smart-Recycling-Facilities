import React, { useEffect } from 'react';
import ScrollReveal from 'scrollreveal';
import { Navbar } from './Navbar'; // Adjust path if in components folder
import { Link } from 'react-router-dom';
import './styles/landing/style.scss'; 

export const LandingPage = () => {
  useEffect(() => {
    // 1. Mandatory Template Setup
    document.documentElement.classList.add('js');
    // We keep 'is-boxed' but we will ensure the wrapper is full-width
    document.body.classList.add('is-boxed', 'has-animations');

    // 2. Initialize ScrollReveal
    const sr = ScrollReveal();
    sr.reveal('.hero-title, .hero-paragraph, .hero-cta', {
      duration: 1000,
      distance: '40px',
      easing: 'cubic-bezier(0.5, -0.01, 0, 1.005)',
      origin: 'bottom',
      interval: 150
    });

    // Cleanup when leaving the page
    return () => {
      document.body.classList.remove('is-boxed', 'has-animations');
    };
  }, []);

  return (
    /* landing-page-wrapper is set to w-full to remove side gaps */
    <div className="landing-page-wrapper" style={{ width: '100%', overflowX: 'hidden' }}>
      
      {/* Navbar stays outside the skewed header to remain fixed and clean */}
      <Navbar />

      <div className="body-wrap boxed-container">
        {/* site-header creates the skewed background shape */}
        <header className="site-header">
          <div className="container">
            <div className="site-header-inner">
              {/* Empty: Navbar is handled above */}
            </div>
          </div>
        </header>

        <main>
          {/* Hero Section: 'section' handles full width, 'container' centers text */}
          <section className="hero section text-center">
            <div className="container-sm">
              <div className="hero-inner section-inner">
                <h1 className="hero-title -mt-10 text-4xl md:text-5xl font-extrabold tracking-tighter text-[#2e2b2b]" style={{ marginTop: '-25px' }}>Smart Waste Management</h1>
                <p className= "hero-paragraph text-lg md:text-xl text-gray-300 font-medium leading-relaxed max-w-2xl mx-auto">
                  Revolutionizing waste segregation with AI-powered detection. 
                  Identify plastic, metal, and organic materials instantly using 
                  our real-time scanning technology.
                </p>
                <div className="hero-cta">
                  <Link to="/detect" className="button button-primary button-shadow">
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Additional Features Section */}
          <section className="features section">
            <div className="container">
              <div className="features-inner section-inner">
                <div className="features-wrap">
                  <div className="feature text-center is-revealing">
                    <div className="feature-inner">
                      <div className="feature-icon" style={{ background: '#2de245', borderRadius: '50%', width: '48px', height: '48px', margin: '0 auto' }}>
                      </div>
                      <h4 className="feature-title mt-24">AI Identification</h4>
                      <p className="text-sm">Categorizes waste into 7 distinct types automatically.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="site-footer">
          <div className="container">
            <div className="site-footer-inner">
              <div className="footer-copyright">
                &copy; 2024 WasteAI Project, all rights reserved
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};