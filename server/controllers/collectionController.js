const Collection = require("../models/Collection");

// Get all collections
const getCollections = async (req, res) => {
  try {
    const collections = await Collection.find().populate("customer");
    res.json(collections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get collections by customer
const getCollectionsByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const collections = await Collection.find({ customer: customerId }).sort({ collectionDate: -1 });
    res.json(collections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create collection
const createCollection = async (req, res) => {
  try {
    const collection = new Collection(req.body);
    await collection.save();
    res.status(201).json(collection);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update collection
const updateCollection = async (req, res) => {
  try {
    const updatedCollection = await Collection.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after", runValidators: true } // <-- updated
    );
    if (!updatedCollection)
      return res.status(404).json({ message: "Collection not found" });

    res.json(updatedCollection);
  } catch (err) {
    res.status(500).json({ message: "Failed to update collection", error: err.message });
  }
};

// Delete collection
const deleteCollection = async (req, res) => {
  try {
    const deletedCollection = await Collection.findByIdAndDelete(req.params.id);
    if (!deletedCollection)
      return res.status(404).json({ message: "Collection not found" });

    res.json({ message: "Collection deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getCollections,
  getCollectionsByCustomer,
  createCollection,
  updateCollection,
  deleteCollection,
};
