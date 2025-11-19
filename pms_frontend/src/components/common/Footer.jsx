import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="premium-footer" style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid rgba(102, 126, 234, 0.2)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: '0'
      }}></div>
      
      <div className="premium-container">
        <div className="footer-content" style={{position: 'relative', zIndex: '1'}}>
          {/* Main Footer Section */}
          <div className="footer-main" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
            gap: '4rem',
            padding: '4rem 0 3rem',
            borderBottom: '1px solid rgba(102, 126, 234, 0.1)'
          }}>
            <div className="footer-brand">
              <div className="footer-logo" style={{marginBottom: '1.5rem'}}>
                <span className="logo-text" style={{
                  fontSize: '2.5rem',
                  fontWeight: '800',
                  background: 'var(--gradient-hero)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Vasudha</span>
              </div>
              <p className="footer-description" style={{
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
                marginBottom: '2rem',
                fontSize: '1.1rem'
              }}>
                Your trusted platform for property rentals. Connecting owners and tenants seamlessly with premium experience.
              </p>
              <div className="social-links" style={{
                display: 'flex',
                gap: '1rem'
              }}>
                {['📘', '🐦', '📷', '💼'].map((icon, index) => (
                  <a 
                    key={index}
                    href="#" 
                    className="social-link" 
                    aria-label="Social Media"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '44px',
                      height: '44px',
                      background: 'rgba(102, 126, 234, 0.1)',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      border: '1px solid rgba(102, 126, 234, 0.2)',
                      backdropFilter: 'blur(10px)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'var(--primary-gradient)';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = 'var(--shadow-md)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <span className="social-icon" style={{fontSize: '1.2rem'}}>{icon}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="footer-links-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '2rem'
            }}>
              {[
                {
                  title: 'For Tenants',
                  links: ['Find Properties', 'How it Works', 'Rental Guide', 'FAQ']
                },
                {
                  title: 'For Owners',
                  links: ['List Property', 'Owner Guide', 'Pricing', 'Success Stories']
                },
                {
                  title: 'Support',
                  links: ['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service']
                },
                {
                  title: 'Company',
                  links: ['About Us', 'Careers', 'Blog', 'Press']
                }
              ].map((column, index) => (
                <div key={index} className="footer-column">
                  <h3 className="footer-title" style={{
                    color: 'var(--text-primary)',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    marginBottom: '1.5rem',
                    background: 'var(--gradient-hero)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    {column.title}
                  </h3>
                  <ul className="footer-list" style={{listStyle: 'none', padding: 0, margin: 0}}>
                    {column.links.map((link, linkIndex) => (
                      <li key={linkIndex} style={{marginBottom: '0.75rem'}}>
                        <Link 
                          to={`/${link.toLowerCase().replace(/\s+/g, '-')}`} 
                          className="footer-link"
                          style={{
                            color: 'var(--text-secondary)',
                            textDecoration: 'none',
                            transition: 'all 0.3s ease',
                            display: 'inline-block',
                            fontSize: '0.95rem'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.color = 'var(--text-primary)';
                            e.target.style.transform = 'translateX(5px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = 'var(--text-secondary)';
                            e.target.style.transform = 'translateX(0)';
                          }}
                        >
                          {link}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="newsletter-section" style={{
            padding: '3rem 0',
            borderBottom: '1px solid rgba(102, 126, 234, 0.1)'
          }}>
            <div className="newsletter-content" style={{
              maxWidth: '500px',
              margin: '0 auto',
              textAlign: 'center'
            }}>
              <h3 className="newsletter-title" style={{
                color: 'var(--text-primary)',
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '1rem',
                background: 'var(--gradient-hero)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Stay Updated
              </h3>
              <p className="newsletter-description" style={{
                color: 'var(--text-secondary)',
                marginBottom: '2rem',
                lineHeight: '1.6'
              }}>
                Get the latest property listings and rental tips delivered to your inbox.
              </p>
              <div className="newsletter-form" style={{
                display: 'flex',
                gap: '1rem',
                maxWidth: '400px',
                margin: '0 auto'
              }}>
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="newsletter-input"
                  style={{
                    flex: '1',
                    padding: '1rem 1.5rem',
                    background: 'var(--bg-card)',
                    border: '1px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary-light)';
                    e.target.style.boxShadow = 'var(--shadow-sm)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button className="newsletter-btn" style={{
                  padding: '1rem 2rem',
                  background: 'var(--primary-gradient)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: 'var(--shadow-md)',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = 'var(--shadow-glow)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'var(--shadow-md)';
                }}
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="footer-bottom" style={{
            padding: '2rem 0 1rem'
          }}>
            <div className="footer-bottom-content" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <p className="copyright" style={{
                color: 'var(--text-muted)',
                margin: 0,
                fontSize: '0.9rem'
              }}>
                © 2025 <strong style={{
                  background: 'var(--gradient-hero)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: '700'
                }}>Vasudha</strong>. All rights reserved. | Capstone Project
              </p>
              <div className="footer-bottom-links" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {['Privacy', 'Terms', 'Sitemap'].map((link, index) => (
                  <React.Fragment key={link}>
                    <Link 
                      to={`/${link.toLowerCase()}`} 
                      className="bottom-link"
                      style={{
                        color: 'var(--text-muted)',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        transition: 'color 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = 'var(--text-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = 'var(--text-muted)';
                      }}
                    >
                      {link}
                    </Link>
                    {index < 2 && (
                      <span className="separator" style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.8rem'
                      }}>•</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .logo-text {
          animation: gradientShift 5s ease infinite;
          background-size: 200% 200%;
        }
      `}</style>
    </footer>
  );
};

export default Footer;