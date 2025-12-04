import React from "react";
import Navbar from "../components/common/Navbar";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import "../styles/index.css";

export default function About() {
  return (
    <>
    <Navbar />
    <div className="about-page">
      
      {/* HERO SECTION */}
      <section className="ac-card">
        <h1 className="ac-hero-title">About Vasudha</h1>
        <p className="ac-hero-subtitle">
          Vasudha is a modern, intelligent platform designed to connect tenants
          and landlords seamlessly. Our mission is to simplify renting through
          transparency, design excellence, and technology-driven tools.
        </p>

        <div className="ac-tag-list">
          <span className="ac-tag">Trusted Platform</span>
          <span className="ac-tag">Smart Tools</span>
          <span className="ac-tag">Secure</span>
          <span className="ac-tag">User-Friendly</span>
        </div>
      </section>

      {/* 3 COLUMN GRID */}
      <section className="ac-card">
        <div className="ac-grid-3">
          <div>
            <h3 className="ac-block-title">Our Mission</h3>
            <p className="ac-block-text">
              We bring clarity, fairness, and convenience to the rental market.
              With digital applications, secure documentation, and automated
              workflows—renting has never been this easy.
            </p>
          </div>

          <div>
            <h3 className="ac-block-title">What We Offer</h3>
            <p className="ac-block-text">
              A full ecosystem for rental management including lease creation,
              property dashboards, tenant portals, secure payments, and more.
            </p>
          </div>

          <div>
            <h3 className="ac-block-title">Who We Serve</h3>
            <p className="ac-block-text">
              Whether you're a landlord managing multiple units or a tenant
              searching for the perfect home — RentEase is built for you.
            </p>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="ac-card">
        <h3 className="ac-block-title">Why People Trust Us</h3>
        <div className="ac-stats-grid">
          <div className="ac-stat-item">
            <div className="ac-stat-number">98%</div>
            <div className="ac-stat-label">User Satisfaction</div>
            <p className="ac-stat-desc">Across both tenants & landlords</p>
          </div>

          <div className="ac-stat-item">
            <div className="ac-stat-number">10,000+</div>
            <div className="ac-stat-label">Applications Managed</div>
            <p className="ac-stat-desc">Seamless digital processing</p>
          </div>

          <div className="ac-stat-item">
            <div className="ac-stat-number">24/7</div>
            <div className="ac-stat-label">Platform Access</div>
            <p className="ac-stat-desc">Anytime, anywhere, on any device</p>
          </div>
        </div>
      </section>
    </div>
    <Footer />
    </>
  );
}
