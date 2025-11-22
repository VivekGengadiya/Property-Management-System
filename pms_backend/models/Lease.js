import mongoose from "mongoose";

const leaseSchema = new mongoose.Schema(
  {
    // CORE RELATIONSHIPS
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    landlordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // BASIC LEASE INFO
    leaseTitle: {
      type: String,
      trim: true,
    },
    leaseType: {
      type: String,
      enum: ["FIXED", "MONTH_TO_MONTH"],
      default: "FIXED",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },

    // MONEY
    rentAmount: {
      type: Number,
      required: true,
    },
    rentFrequency: {
      type: String,
      enum: ["MONTHLY", "WEEKLY", "YEARLY"],
      default: "MONTHLY",
    },
    dueDay: {
      type: Number,
      min: 1,
      max: 28,
      default: 1,
    },
    depositAmount: {
      type: Number,
      default: 0,
    },

    // PAYMENT METHOD & LATE FEES
    paymentMethod: {
      type: String,
      enum: ["E_TRANSFER", "POST_DATED_CHEQUES", "CASH", "OTHER"],
      default: "E_TRANSFER",
    },
    lateFeeType: {
      type: String,
      enum: ["FLAT", "PERCENTAGE", "NONE"],
      default: "NONE",
    },
    lateFeeValue: {
      type: Number,
      default: 0, // $ or % depending on lateFeeType
    },
    discountNotes: {
      type: String,
      trim: true,
    },

    // RULES & OPTIONS
    petsAllowed: {
      type: String,
      enum: ["NO", "YES", "WITH_RESTRICTIONS"],
      default: "NO",
    },
    smokingAllowed: {
      type: String,
      enum: ["NO", "OUTDOORS_ONLY"],
      default: "NO",
    },
    parkingIncluded: {
      type: String,
      enum: ["YES", "NO", "PAID_EXTRA"],
      default: "YES",
    },
    furnished: {
      type: String,
      enum: ["NO", "PARTIALLY", "FULLY"],
      default: "NO",
    },
    utilitiesIncluded: {
      type: String,
      trim: true, // description text
    },

    // EXTRA CONTACT & CLAUSES
    emergencyContactName: {
      type: String,
      trim: true,
    },
    emergencyContactPhone: {
      type: String,
      trim: true,
    },
    additionalTerms: {
      type: String,
      trim: true,
    },

    // STATUS & DOCS
    status: {
      type: String,
      enum: ["ACTIVE", "PENDING", "TERMINATED", "EXPIRED", "REJECTED"],
      default: "PENDING",
    },
    documents: [
      {
        name: String,
        url: String,
      },
    ],
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// INDEXES FOR PERFORMANCE
leaseSchema.index({ unitId: 1 });
leaseSchema.index({ tenantId: 1 });
leaseSchema.index({ landlordId: 1 });
leaseSchema.index({ propertyId: 1 });
leaseSchema.index({ status: 1 });
leaseSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.model("Lease", leaseSchema);
