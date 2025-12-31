const User = require('../models/userModel');

const listarTecnicos = async (req, res, next) => {
    try {
        const tecnicos = await User.findTechnicians();
        res.json({ status: 'success', data: tecnicos });
    } catch (error) {
        next(error);
    }
};

module.exports = { listarTecnicos };