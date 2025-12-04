import React, { useState } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import "../styles/index.css";

const initialFormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function Contact() {
  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const errorTextStyle = {
    color: "rgb(220, 38, 38)",
    fontSize: "0.8rem",
    marginTop: "0.25rem",
  };

  const validateForm = () => {
    const newErrors = {};

    // Name – required, letters + spaces, min length
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      newErrors.name = "Please enter your full name.";
    } else if (!/^[a-zA-Z\s'-]{2,60}$/.test(trimmedName)) {
      newErrors.name =
        "Name should contain only letters, spaces, and be 2–60 characters long.";
    }

    // Email – basic but robust pattern
    const trimmedEmail = form.email.trim();
    if (!trimmedEmail) {
      newErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = "Please enter a valid email address (e.g., you@example.com).";
    }

    // Subject – optional but limited
    const trimmedSubject = form.subject.trim();
    if (trimmedSubject.length > 120) {
      newErrors.subject = "Subject should be under 120 characters.";
    }

    // Message – required, reasonable length
    const trimmedMessage = form.message.trim();
    if (!trimmedMessage) {
      newErrors.message = "Please include a brief description of your request.";
    } else if (trimmedMessage.length < 20) {
      newErrors.message =
        "Message should be at least 20 characters so we can understand your request.";
    } else if (trimmedMessage.length > 2000) {
      newErrors.message = "Message is too long. Please keep it under 2000 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error for that field while typing
    setSubmitted(false);
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(false);

    const isValid = validateForm();
    if (!isValid) return;

    // Simulate secure submit (you can replace with real API call)
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setForm(initialFormState);
    }, 600);
  };

  return (
    <>
      <Navbar />
      <div className="contact-page">
        <section className="ac-card ac-contact-grid">
          {/* LEFT SIDE INFO */}
          <div className="ac-contact-info">
            <h1 className="ac-hero-title">Contact Us</h1>
            <p className="ac-hero-subtitle">
              We’re here to help! Whether you have a question about renting,
              features, pricing, or need technical support — our team is ready
              to assist you.
            </p>

            <div className="ac-contact-details">
              <div>
                <h3>Email</h3>
                <p>support@vasudha.ca</p>
              </div>

              <div>
                <h3>Phone</h3>
                <p>+1 (647) 555-9001</p>
              </div>

              <div>
                <h3>Office</h3>
                <p>Toronto, ON, Canada</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE FORM */}
          <div className="ac-contact-form-wrap">
            {submitted && (
              <div className="ac-success-msg">
                ✔️ Your message has been sent. Our team will get back to you as
                soon as possible.
              </div>
            )}

            <form className="ac-contact-form" onSubmit={handleSubmit} noValidate>
              {/* Name */}
              <div className="ac-field-group">
                <input
                  className="ac-input"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  aria-label="Your name"
                  aria-invalid={!!errors.name}
                  required
                />
                {errors.name && (
                  <p style={errorTextStyle}>{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="ac-field-group">
                <input
                  className="ac-input"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Your Email"
                  aria-label="Your email address"
                  aria-invalid={!!errors.email}
                  required
                />
                {errors.email && (
                  <p style={errorTextStyle}>{errors.email}</p>
                )}
              </div>

              {/* Subject (optional) */}
              <div className="ac-field-group">
                <input
                  className="ac-input"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Subject (optional)"
                  aria-label="Subject"
                />
                {errors.subject && (
                  <p style={errorTextStyle}>{errors.subject}</p>
                )}
              </div>

              {/* Message */}
              <div className="ac-field-group">
                <textarea
                  className="ac-input ac-textarea"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Your Message"
                  aria-label="Your message"
                  aria-invalid={!!errors.message}
                  rows={5}
                  required
                />
                {errors.message && (
                  <p style={errorTextStyle}>{errors.message}</p>
                )}
              </div>

              <button
                className="ac-btn"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
