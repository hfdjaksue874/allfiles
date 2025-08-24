
import Pincode from '../models/pincode.js';

const createPincode = async (req, res) => {
    const {pincode} = req.body;
    try {
        const existingPincode = await Pincode.findOne({pincode});
        if (existingPincode) {
            return res.status(409).json({ error: "Pincode already exists" });
        }

        const newPincode = new Pincode({ pincode });
        await newPincode.save();

        res.status(201).json({ 
            success: true, 
            message: "Pincode created successfully",
            pincode: newPincode._id,
        });
        
    } catch (error) {
        console.error("Create Pincode Error:", error);
        res.status(500).json({ 
            success: false, 
            error: "Failed to create pincode: " + error.message 
        });
    }
};

const deletePincode = async (req, res) => {
    const {pincode} = req.body;
    try {
        const existingPincode = await Pincode.findOne({pincode});
        if (!existingPincode) {
            return res.status(404).json({ error: "Pincode not found" });
        }

        await Pincode.deleteOne({ pincode });

        res.status(200).json({ 
            success: true, 
            message: "Pincode deleted successfully" 
        });
        
    } catch (error) {
        console.error("Delete Pincode Error:", error);
        res.status(500).json({ 
            success: false, 
            error: "Failed to delete pincode: " + error.message 
        });
    }
};

const getPincode = async (req, res) => {
    try {
        const pincodes = await Pincode.find({});
        if (!pincodes || pincodes.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: "No pincodes found" 
            });
        }

        res.status(200).json({ 
            success: true,
            message: "Pincodes retrieved successfully",
            pincodes: pincodes 
        });
        
    } catch (error) {
        console.error("Get Pincode Error:", error);
        res.status(500).json({ 
            success: false, 
            error: "Failed to get pincodes: " + error.message 
        });
    }
};

export { createPincode, deletePincode, getPincode }
