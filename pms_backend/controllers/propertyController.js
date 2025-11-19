import Property from "../models/Property.js";

const normalizeAddress = (body, existing = {}) => {
  // Support nested (preferred) or flat (legacy) address input
  const addr = body.address || {};
  const city = addr.city ?? body.city ?? existing.city ?? "";
  const state = addr.state ?? body.state ?? existing.state ?? "";
  const country = addr.country ?? body.country ?? existing.country ?? "";
  const line1 = addr.line1 ?? body.line1 ?? existing.line1 ?? "";
  const line2 = addr.line2 ?? body.line2 ?? existing.line2 ?? "";
  const postalCodeRaw = addr.postalCode ?? body.postalCode ?? existing.postalCode ?? "";

  // Normalize postalCode: strip spaces, uppercase
  const postalCode = String(postalCodeRaw).replace(/\s+/g, "").toUpperCase();

  return { line1, line2, city, state, country, postalCode };
};

const validateAddress = (address) => {
  const errors = [];

  if (!address.line1?.trim()) errors.push({ path: "address.line1", msg: "Address line 1 is required" });
  if (!address.city?.trim()) errors.push({ path: "address.city", msg: "City is required" });
  if (!address.state?.trim()) errors.push({ path: "address.state", msg: "State is required" });
  if (!address.country?.trim()) errors.push({ path: "address.country", msg: "Country is required" });

  if (!address.postalCode?.trim()) {
    errors.push({ path: "address.postalCode", msg: "Postal code is required" });
  } else if (!/^[A-Za-z0-9]{6}$/.test(address.postalCode)) {
    errors.push({ path: "address.postalCode", msg: "Postal code must be exactly 6 alphanumeric characters" });
  }

  return errors;
};

/* -------------------------------------------------
   🏠 CREATE PROPERTY
--------------------------------------------------- */
export const createProperty = async (req, res) => {
  try {
    const { landlordId, name, propertyType, amenities } = req.body;

    const errors = [];
    if (!landlordId) errors.push({ path: "landlordId", msg: "landlordId is required" });
    if (!name?.trim()) errors.push({ path: "name", msg: "Property name is required" });

    const address = normalizeAddress(req.body);
    errors.push(...validateAddress(address));

    if (errors.length) {
      return res.status(400).json({ success: false, message: "Validation failed", errors });
    }

    //
    const newProperty = {
      landlordId,
      name: name.trim(),
      propertyType: propertyType || "APARTMENT",
      address,
      amenities: amenities ? (Array.isArray(amenities) ? amenities : [amenities]) : [],
      image: req.file ? req.file.path : null, // <-- Cloudinary URL here
    };

    const property = await Property.create(newProperty);
    return res.status(201).json({ success: true, data: property });
  } catch (error) {
    console.error("❌ createProperty error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* -------------------------------------------------
   🏘 GET ALL PROPERTIES
--------------------------------------------------- */
export const getProperties = async (req, res) => {
  try {
    const properties = await Property.find();
    res.json({ success: true, data: properties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* -------------------------------------------------
   🏠 GET PROPERTY BY ID
--------------------------------------------------- */
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* -------------------------------------------------
   ✏️ UPDATE PROPERTY
--------------------------------------------------- */
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    // ✅ Cloudinary: replace image if new one uploaded
    if (req.file) {
      req.body.image = req.file.path; // Cloudinary URL
    }

    // Build update payload
    const updateData = { ...req.body };

    // If any address fields are present, merge & validate
    const hasAnyAddressField =
      req.body.address ||
      ["line1", "line2", "city", "state", "country", "postalCode"].some((k) => k in req.body);

    if (hasAnyAddressField) {
      const mergedAddress = normalizeAddress(req.body, property.address || {});
      const addressErrors = validateAddress(mergedAddress);
      if (addressErrors.length) {
        return res.status(400).json({ success: false, message: "Validation failed", errors: addressErrors });
      }
      updateData.address = mergedAddress;
      ["line1", "line2", "city", "state", "country", "postalCode"].forEach((k) => delete updateData[k]);
    }

    const updatedProperty = await Property.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ success: true, data: updatedProperty });
  } catch (error) {
    console.error("❌ updateProperty error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* -------------------------------------------------
   🗑 DELETE PROPERTY
--------------------------------------------------- */
export const deleteProperty = async (req, res) => {
  try {
    await Property.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Property deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
