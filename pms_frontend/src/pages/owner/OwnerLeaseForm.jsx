import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { applicationsAPI, leaseAPI } from "../../services/api";

const OwnerLeaseForm = () => {
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);

  const [form, setForm] = useState({
    applicationId: "",
    leaseTitle: "",
    leaseType: "FIXED",
    startDate: "",
    endDate: "",
    dueDay: "1",

    // Financial
    rentFrequency: "MONTHLY",
    paymentMethod: "E_TRANSFER",
    lateFeeType: "FLAT", // FLAT or PERCENTAGE
    lateFeeValue: "",
    discountNotes: "",

    // Rules & options
    petsAllowed: "NO",
    smokingAllowed: "NO",
    parkingIncluded: "YES",
    utilitiesIncluded: "",
    furnished: "NO",

    // Extra details
    emergencyContactName: "",
    emergencyContactPhone: "",
    additionalTerms: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({}); // 👈 per-field errors

  // Load APPROVED applications
  useEffect(() => {
    const fetchApprovedApps = async () => {
      try {
        setLoadingApps(true);
        setErrorMsg("");

        const res = await applicationsAPI.listForLandlord("APPROVED");
        if (!res.success) throw new Error(res.message || "Failed to load applications");
        setApplications(res.data || []);
      } catch (err) {
        console.error("Error loading applications:", err);
        setErrorMsg(err.message || "Failed to load applications");
      } finally {
        setLoadingApps(false);
      }
    };

    if (user) {
      fetchApprovedApps();
    } else {
      setLoadingApps(false);
    }
  }, [user]);

  const selectedApp = useMemo(
    () => applications.find((a) => a._id === form.applicationId),
    [applications, form.applicationId]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for that field as user edits
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // 🔎 VALIDATION FUNCTION
  const validateForm = () => {
    const errors = {};

    // Required: application
    if (!form.applicationId) {
      errors.applicationId = "Please select an approved application.";
    }

    // Lease title
    if (!form.leaseTitle.trim()) {
      errors.leaseTitle = "Lease title is required.";
    }

    // Dates
    // Dates
    if (!form.startDate) {
      errors.startDate = "Start date is required.";
    }
    if (!form.endDate) {
      errors.endDate = "End date is required.";
    }

    if (form.startDate) {
      const start = new Date(form.startDate);
      const today = new Date();
      // normalize to midnight so we compare only by date
      today.setHours(0, 0, 0, 0);
      start.setHours(0, 0, 0, 0);

      if (start <= today) {
        errors.startDate = "Please ensure the start date is selected is later than today's date.";
      }
    }

    if (form.endDate) {
      const end = new Date(form.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      if (end <= today) {
        errors.endDate = "Please ensure the end date is selected is later than today's date.";
      }
    }

    // compare start and end if both valid so far
    if (form.startDate && form.endDate && !errors.startDate && !errors.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      if (end <= start) {
        errors.endDate = "End date must be after the start date.";
      }
    }

    // Due day
    const due = Number(form.dueDay);
    if (!form.dueDay) {
      errors.dueDay = "Rent due day is required.";
    } else if (Number.isNaN(due) || due < 1 || due > 28) {
      errors.dueDay = "Due day must be a number between 1 and 28.";
    }

    // Rent frequency
    if (!form.rentFrequency) {
      errors.rentFrequency = "Please select a rent frequency.";
    }

    // Payment method
    if (!form.paymentMethod) {
      errors.paymentMethod = "Please select a preferred payment method.";
    }

    // Late fee
    if (!form.lateFeeType) {
      errors.lateFeeType = "Please select a late fee type.";
    } else if (form.lateFeeType === "FLAT" || form.lateFeeType === "PERCENTAGE") {
      if (!form.lateFeeValue) {
        errors.lateFeeValue = "Please enter a late fee value.";
      } else {
        const fee = Number(form.lateFeeValue);
        if (Number.isNaN(fee) || fee <= 0) {
          errors.lateFeeValue = "Late fee must be a positive number.";
        }
      }
    }

    // Rules (these have defaults but still validate empty just in case)
    if (!form.petsAllowed) {
      errors.petsAllowed = "Please choose a pets policy.";
    }
    if (!form.smokingAllowed) {
      errors.smokingAllowed = "Please choose a smoking policy.";
    }
    if (!form.parkingIncluded) {
      errors.parkingIncluded = "Please choose a parking option.";
    }
    if (!form.furnished) {
      errors.furnished = "Please choose a furnished option.";
    }

    // Optional fields like utilitiesIncluded, emergencyContact*, additionalTerms
    // can stay without required validation.

    // 🔔 Emergency Contact Phone (optional but must be valid Canadian number if entered)
if (form.emergencyContactPhone.trim() !== "") {
  const raw = form.emergencyContactPhone.trim();

  // allow only digits, spaces, +, -, parentheses
  const allowedCharsRegex = /^[0-9+\-\s()]+$/;
  if (!allowedCharsRegex.test(raw)) {
    errors.emergencyContactPhone =
      "Phone number can only include digits, spaces, +, -, or brackets.";
  } else {
    // strip all non-digits
    let digits = raw.replace(/\D/g, "");

    // allow leading +1 (country code)
    if (digits.length === 11 && digits.startsWith("1")) {
      digits = digits.slice(1);
    }

    // must now be exactly 10 digits
    if (digits.length !== 10) {
      errors.emergencyContactPhone =
        "Please enter a valid 10-digit Canadian phone number.";
    } else {
      // Canadian area code rule: cannot start with 0 or 1
      if (digits[0] === "0" || digits[0] === "1") {
        errors.emergencyContactPhone =
          "Canadian area codes must begin with digits 2–9.";
      }
    }
  }
}

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");
    setFieldErrors({});

    // ✅ Run validation
    const isValid = validateForm();
    if (!isValid) {
      setErrorMsg("Please correct the highlighted fields.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        applicationId: form.applicationId,
        startDate: form.startDate,
        endDate: form.endDate,
        dueDay: Number(form.dueDay) || 1,

        leaseTitle: form.leaseTitle,
        leaseType: form.leaseType,
        rentFrequency: form.rentFrequency,
        paymentMethod: form.paymentMethod,
        lateFeeType: form.lateFeeType,
        lateFeeValue: form.lateFeeValue,
        discountNotes: form.discountNotes,

        petsAllowed: form.petsAllowed,
        smokingAllowed: form.smokingAllowed,
        parkingIncluded: form.parkingIncluded,
        utilitiesIncluded: form.utilitiesIncluded,
        furnished: form.furnished,

        emergencyContactName: form.emergencyContactName,
        emergencyContactPhone: form.emergencyContactPhone,
        additionalTerms: form.additionalTerms,
      };

      const res = await leaseAPI.create(payload);
      if (!res.success) throw new Error(res.message || "Failed to create lease");

      setSuccessMsg("✅ Lease created successfully and linked to the selected tenant.");
      setForm((prev) => ({
        ...prev,
        applicationId: "",
        leaseTitle: "",
        startDate: "",
        endDate: "",
        lateFeeValue: "",
        discountNotes: "",
        utilitiesIncluded: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        additionalTerms: "",
      }));
    } catch (err) {
      console.error("Lease create error:", err);
      setErrorMsg(err.message || "Failed to create lease");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="page-wrap">
        <div className="card">Please log in as a landlord to create leases.</div>
      </div>
    );
  }

  return (
    <div className="page-wrap" style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem" }}>
      {/* Header */}
      <header style={{ marginBottom: "1.5rem" }}>
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            background: "var(--gradient-hero)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Lease Form
        </h2>

      </header>

      {/* Alerts */}
      {errorMsg && (
        <div
          style={{
            marginBottom: "1rem",
            padding: ".75rem 1rem",
            borderRadius: 12,
            background: "rgba(248,113,113,.1)",
            color: "rgb(220,38,38)",
            border: "1px solid rgba(248,113,113,.6)",
          }}
        >
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div
          style={{
            marginBottom: "1rem",
            padding: ".75rem 1rem",
            borderRadius: 12,
            background: "rgba(34,197,94,.08)",
            color: "rgb(22,163,74)",
            border: "1px solid rgba(34,197,94,.5)",
          }}
        >
          {successMsg}
        </div>
      )}

      {/* Card */}
      <section
        style={{
          background: "var(--bg-card)",
          borderRadius: 24,
          padding: "1.8rem",
          boxShadow: "var(--shadow-lg)",
          border: "1px solid rgba(148,163,184,.3)",
        }}
      >
        <form onSubmit={handleSubmit}>
          {/* SECTION 1 – Link to Approved Application */}
          <SectionTitle
            title="1. Tenant & Unit"
            subtitle="Pick an approved application to auto-link the tenant and unit."
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 2fr) minmax(0, 3fr)",
              gap: "1.5rem",
              marginBottom: "1.5rem",
              alignItems: "flex-start",
            }}
          >
            <div>
              <label className="field-label" htmlFor="applicationId">
                Approved Application
              </label>
              {loadingApps ? (
                <div style={{ color: "var(--text-secondary)" }}>Loading applications…</div>
              ) : applications.length === 0 ? (
                <div style={{ color: "var(--text-secondary)" }}>
                  No approved applications found. Approve an application first on the{" "}
                  <strong>Applications</strong> tab.
                </div>
              ) : (
                <>
                  <select
                    id="applicationId"
                    name="applicationId"
                    value={form.applicationId}
                    onChange={handleChange}
                    style={inputStyle}
                  >
                    <option value="">Select approved application…</option>
                    {applications.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.tenantId?.name || "Tenant"} – Unit {a.unitId?.unitNumber || "?"} –{" "}
                        {a.unitId?.propertyId?.name || "Property"}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.applicationId && (
                    <div style={errorTextStyle}>{fieldErrors.applicationId}</div>
                  )}
                </>
              )}
            </div>

            <div
              style={{
                padding: "1rem 1.2rem",
                borderRadius: 16,
                background: "rgba(148,163,184,.08)",
                border: "1px solid rgba(148,163,184,.35)",
                minHeight: 120,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: ".4rem" }}>Selected summary</div>
              {selectedApp ? (
                <>
                  <DetailRow label="Tenant" value={selectedApp.tenantId?.name} />
                  <DetailRow label="Email" value={selectedApp.tenantId?.email || "—"} />
                  <DetailRow
                    label="Unit"
                    value={`#${selectedApp.unitId?.unitNumber || "?"} (${selectedApp.unitId?.status || ""})`}
                  />
                  <DetailRow
                    label="Property"
                    value={selectedApp.unitId?.propertyId?.name || "—"}
                  />
                  <DetailRow
                    label="Rent"
                    value={
                      typeof selectedApp.unitId?.rentAmount === "number"
                        ? `$${selectedApp.unitId.rentAmount.toFixed(2)} / month`
                        : "—"
                    }
                  />
                </>
              ) : (
                <div style={{ color: "var(--text-secondary)", fontSize: ".9rem" }}>
                  Select an approved application to see the tenant and unit details here.
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2 – Lease Basics */}
          <SectionTitle
            title="2. Lease Basics"
            subtitle="Core information about the lease such as type and dates."
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <Field
              label="Lease Title"
              name="leaseTitle"
              value={form.leaseTitle}
              onChange={handleChange}
              placeholder="e.g., 1-Year Residential Tenancy Agreement"
              error={fieldErrors.leaseTitle}
            />

            <div>
              <label className="field-label" htmlFor="leaseType">
                Lease Type
              </label>
              <select
                id="leaseType"
                name="leaseType"
                value={form.leaseType}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="FIXED">Fixed Term</option>
                <option value="MONTH_TO_MONTH">Month-to-Month</option>
              </select>
              {/* leaseType has a default and is always valid, so no error display */}
            </div>

            <Field
              label="Start Date"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
              error={fieldErrors.startDate}
            />

            <Field
              label="End Date"
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleChange}
              error={fieldErrors.endDate}
            />

            <Field
              label="Rent Due Day (1–28)"
              name="dueDay"
              type="number"
              min="1"
              max="28"
              value={form.dueDay}
              onChange={handleChange}
              error={fieldErrors.dueDay}
            />
          </div>

          {/* SECTION 3 – Financial Terms */}
          <SectionTitle
            title="3. Financial Terms"
            subtitle="Set payment frequency, method, and late fee rules."
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div>
              <label className="field-label" htmlFor="rentFrequency">
                Rent Frequency
              </label>
              <select
                id="rentFrequency"
                name="rentFrequency"
                value={form.rentFrequency}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="MONTHLY">Monthly</option>
                <option value="WEEKLY">Weekly</option>
                <option value="YEARLY">Yearly</option>
              </select>
              {fieldErrors.rentFrequency && (
                <div style={errorTextStyle}>{fieldErrors.rentFrequency}</div>
              )}
            </div>

            <div>
              <label className="field-label" htmlFor="paymentMethod">
                Preferred Payment Method
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="E_TRANSFER">E-Transfer</option>
                <option value="POST_DATED_CHEQUES">Post-Dated Cheques</option>
                <option value="CASH">Cash</option>
                <option value="OTHER">Other</option>
              </select>
              {fieldErrors.paymentMethod && (
                <div style={errorTextStyle}>{fieldErrors.paymentMethod}</div>
              )}
            </div>

            <div>
              <label className="field-label" htmlFor="lateFeeType">
                Late Fee Type
              </label>
              <select
                id="lateFeeType"
                name="lateFeeType"
                value={form.lateFeeType}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="FLAT">Flat Amount</option>
                <option value="PERCENTAGE">Percentage of Rent</option>
              </select>
              {fieldErrors.lateFeeType && (
                <div style={errorTextStyle}>{fieldErrors.lateFeeType}</div>
              )}
            </div>

            <Field
              label={
                form.lateFeeType === "FLAT"
                  ? "Late Fee Amount ($)"
                  : "Late Fee Percentage (%)"
              }
              name="lateFeeValue"
              type="number"
              step="0.01"
              value={form.lateFeeValue}
              onChange={handleChange}
              placeholder={form.lateFeeType === "FLAT" ? "e.g., 50" : "e.g., 5"}
              error={fieldErrors.lateFeeValue}
            />
          </div>

          <Field
            label="Discounts or special pricing notes (optional)"
            name="discountNotes"
            value={form.discountNotes}
            onChange={handleChange}
            placeholder="e.g., $50/month reduction for first 3 months"
            textarea
          // optional, no required validation
          />

          {/* SECTION 4 – Rules & Options */}
          <SectionTitle
            title="4. Rules & Options"
            subtitle="Indicate property rules included in this lease."
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <SelectField
              label="Pets Allowed"
              name="petsAllowed"
              value={form.petsAllowed}
              onChange={handleChange}
              options={[
                { value: "NO", label: "No" },
                { value: "YES", label: "Yes" },
                { value: "WITH_RESTRICTIONS", label: "Allowed with restrictions" },
              ]}
              error={fieldErrors.petsAllowed}
            />

            <SelectField
              label="Smoking Allowed"
              name="smokingAllowed"
              value={form.smokingAllowed}
              onChange={handleChange}
              options={[
                { value: "NO", label: "No" },
                { value: "OUTDOORS_ONLY", label: "Outdoors only" },
              ]}
              error={fieldErrors.smokingAllowed}
            />

            <SelectField
              label="Parking Included"
              name="parkingIncluded"
              value={form.parkingIncluded}
              onChange={handleChange}
              options={[
                { value: "YES", label: "Yes" },
                { value: "NO", label: "No" },
                { value: "PAID_EXTRA", label: "Paid extra" },
              ]}
              error={fieldErrors.parkingIncluded}
            />

            <SelectField
              label="Furnished"
              name="furnished"
              value={form.furnished}
              onChange={handleChange}
              options={[
                { value: "NO", label: "No" },
                { value: "PARTIALLY", label: "Partially furnished" },
                { value: "FULLY", label: "Fully furnished" },
              ]}
              error={fieldErrors.furnished}
            />
          </div>

          <Field
            label="Utilities included (describe)"
            name="utilitiesIncluded"
            value={form.utilitiesIncluded}
            onChange={handleChange}
            placeholder="e.g., Water and heat included. Tenant pays hydro and internet."
            textarea
          // optional
          />

          {/* SECTION 5 – Contacts & Additional Terms */}
          <SectionTitle
            title="5. Emergency Contact & Custom Clauses"
            subtitle="Add emergency contact and any extra legal terms."
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <Field
              label="Emergency Contact Name (optional)"
              name="emergencyContactName"
              value={form.emergencyContactName}
              onChange={handleChange}
            // optional
            />

            <Field
              label="Emergency Contact Phone (optional)"
              name="emergencyContactPhone"
              value={form.emergencyContactPhone}
              onChange={(e) => {
                // allow only digits, spaces, +, -, and ()
                const cleaned = e.target.value.replace(/[^0-9+\-\s()]/g, "");
                setForm((prev) => ({ ...prev, emergencyContactPhone: cleaned }));
                setFieldErrors((prev) => ({ ...prev, emergencyContactPhone: "" }));
              }}
              placeholder="e.g., +1 647-555-1234 (Canadian format)"
              error={fieldErrors.emergencyContactPhone}
            />

          </div>

          <Field
            label="Additional Terms / Special Clauses"
            name="additionalTerms"
            value={form.additionalTerms}
            onChange={handleChange}
            textarea
            placeholder="e.g., Noise policy, renewal conditions, move-out instructions, etc."
          // optional
          />

          {/* Submit */}
          <div style={{ marginTop: "2rem" }}>
            <button
              type="submit"
              disabled={submitting || applications.length === 0}
              style={{
                padding: ".9rem 1.6rem",
                borderRadius: 999,
                border: "none",
                background:
                  "linear-gradient(135deg, #667eea 0%, #38b2ac 50%, #10b981 100%)",
                color: "#fff",
                fontWeight: 700,
                fontSize: ".95rem",
                cursor: submitting ? "wait" : "pointer",
                boxShadow: "var(--shadow-lg)",
                opacity: submitting || applications.length === 0 ? 0.7 : 1,
                transition: "transform .15s ease, box-shadow .15s ease",
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-xl)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "var(--shadow-lg)";
              }}
            >
              {submitting ? "Creating Lease…" : "Create Lease"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

// Shared styles for inputs
const inputStyle = {
  width: "100%",
  padding: ".75rem 1rem",
  borderRadius: 12,
  border: "1px solid rgba(148,163,184,.6)",
  background: "var(--bg-primary)",
  color: "var(--text-primary)",
  fontSize: ".9rem",
};

const errorTextStyle = {
  color: "rgb(220, 38, 38)",
  fontSize: ".8rem",
  marginTop: ".25rem",
};

// Small components

const SectionTitle = ({ title, subtitle }) => (
  <div style={{ marginBottom: ".75rem", marginTop: "1.5rem" }}>
    <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>{title}</h3>
    {subtitle && (
      <p style={{ color: "var(--text-secondary)", fontSize: ".85rem" }}>{subtitle}</p>
    )}
  </div>
);

const Field = ({
  label,
  name,
  value,
  onChange,
  textarea,
  type = "text",
  error,
  ...rest
}) => (
  <div style={{ marginBottom: "1rem" }}>
    <label className="field-label" htmlFor={name}>
      {label}
    </label>
    {textarea ? (
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={3}
        style={{ ...inputStyle, resize: "vertical" }}
        {...rest}
      />
    ) : (
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        style={inputStyle}
        {...rest}
      />
    )}
    {error && <div style={errorTextStyle}>{error}</div>}
  </div>
);

const SelectField = ({ label, name, value, onChange, options, error }) => (
  <div style={{ marginBottom: "1rem" }}>
    <label className="field-label" htmlFor={name}>
      {label}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      style={inputStyle}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <div style={errorTextStyle}>{error}</div>}
  </div>
);

const DetailRow = ({ label, value }) => (
  <div style={{ fontSize: ".85rem", marginBottom: ".2rem" }}>
    <span style={{ color: "var(--text-secondary)" }}>{label}: </span>
    <span style={{ fontWeight: 500 }}>{value || "—"}</span>
  </div>
);

export default OwnerLeaseForm;
