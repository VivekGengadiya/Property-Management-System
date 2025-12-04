import React from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import Button from "../components/ui/Button";
import "../styles/index.css";

const Media = () => {
    return (
        <>
            <Navbar />
            <div className="media-page">
                {/* HERO SECTION */}
                <section className="media-hero">
                    <div className="premium-container">
                        <div className="media-hero-inner">
                            <div className="media-hero-text">
                                <p className="media-kicker">Press & Partnerships</p>
                                <h1 className="media-title">
                                    Vasudha in the{" "}
                                    <span className="text-gradient">News & Media</span>
                                </h1>
                                <p className="media-subtitle">
                                    Explore our latest press coverage, brand assets, and media
                                    resources. Whether you’re a journalist, partner, or creator,
                                    this page is your hub for all official Vasudha content.
                                </p>

                                <div className="media-hero-highlights">
                                    <div className="media-highlight-pill">
                                        🌎 Featured across multiple cities
                                    </div>
                                    <div className="media-highlight-pill">
                                        🤝 Collaborations with property experts
                                    </div>
                                    <div className="media-highlight-pill">
                                        🏠 Simplifying rentals for modern living
                                    </div>
                                </div>
                            </div>

                            <div className="media-hero-card">
                                <div className="media-badge">Media Kit</div>
                                <h2>Quick Facts</h2>
                                <ul>
                                    <li>📍 HQ: Ontario, Canada</li>
                                    <li>🏘 10K+ verified rental listings</li>
                                    <li>👥 50K+ registered users</li>
                                    <li>💼 Serving landlords, tenants & staff</li>
                                </ul>
                                <p className="media-card-note">
                                    Need logos, screenshots, or product copy? Reach out via the
                                    Contact page and we’ll share a tailored media kit.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* MAIN CONTENT SECTIONS */}
                <section className="media-section">
                    <div className="premium-container">
                        <div className="media-section-header">
                            <h2 className="media-section-title">Media Resources</h2>
                            <p className="media-section-subtitle">
                                Use these resources to understand our story, our mission, and how
                                we’re improving the rental experience for everyone.
                            </p>
                        </div>

                        <div className="media-grid">
                            {/* Card 1 – Brand Story */}
                            <article className="media-card">
                                <h3>Brand Story</h3>
                                <p>
                                    Vasudha was created to solve a simple problem: renting shouldn’t
                                    be stressful. We bring tenants, landlords, and maintenance
                                    teams together in one transparent, digital platform.
                                </p>
                                <p>
                                    Our focus is on verified listings, clear communication, and
                                    smooth operations—so people can spend less time worrying about
                                    paperwork and more time living.
                                </p>
                            </article>

                            {/* Card 2 – Product Snapshot */}
                            <article className="media-card">
                                <h3>Product Snapshot</h3>
                                <ul className="media-list">
                                    <li>Role-based dashboards for landlords, tenants & staff</li>
                                    <li>Lease management, payments, and maintenance tickets</li>
                                    <li>Application tracking for tenants and property owners</li>
                                    <li>Designed with a modern, clean, and accessible UI</li>
                                </ul>
                            </article>

                            {/* Card 3 – Key Messages */}
                            <article className="media-card">
                                <h3>Key Messages</h3>
                                <ul className="media-list">
                                    <li>Vasudha makes renting organized, transparent, and secure.</li>
                                    <li>We support both small property owners and larger portfolios.</li>
                                    <li>Our platform is built with real-world rental workflows in mind.</li>
                                    <li>
                                        We’re focused on long-term relationships, not short-term
                                        transactions.
                                    </li>
                                </ul>
                            </article>
                        </div>
                    </div>
                </section>

                {/* PRESS HIGHLIGHTS / QUOTES */}
                <section className="media-section media-section-alt">
                    <div className="premium-container">
                        <div className="media-section-header">
                            <h2 className="media-section-title">Our Press Highlights & Quotes</h2>
                            <p className="media-section-subtitle">
                                Hear from industry experts, partners, and our internal team about how
                                Vasudha is transforming the rental landscape.
                            </p>
                        </div>

                        <div className="media-quotes-grid">
                            <div className="media-quote-card">
                                <p className="media-quote-text">
                                    “Vasudha is modernizing the rental journey from listing to
                                    maintenance—making it easier for landlords and tenants to stay
                                    connected.”
                                </p>
                                <p className="media-quote-source">— Internal Product Vision</p>
                            </div>

                            <div className="media-quote-card">
                                <p className="media-quote-text">
                                    “Instead of juggling emails, spreadsheets, and paper forms,
                                    users manage everything in one secure dashboard.”
                                </p>
                                <p className="media-quote-source">— Platform Overview Note</p>
                            </div>

                            <div className="media-quote-card">
                                <p className="media-quote-text">
                                    “The goal is not just to rent properties, but to build trust
                                    between owners, tenants, and support teams.”
                                </p>
                                <p className="media-quote-source">— Team Mission Statement</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
};

export default Media;
