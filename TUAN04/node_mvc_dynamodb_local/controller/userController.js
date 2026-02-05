const userModel = require("../model/userModel");

const renderHome = async (req, res) => {
    try {
        const users = await userModel.getAllUsers();
        res.render("index", { users });
    } catch (error) {
        res.status(500).send("Error fetching users");
    }
};

const addUser = async (req, res) => {
    const { userId, name, email } = req.body;
    try {
        await userModel.createUser(userId, name, email);
        res.redirect("/");
    } catch (error) {
        res.status(500).send("Error adding user");
    }
};

const deleteUser = async (req, res) => {
    const { userId } = req.body;
    try {
        await userModel.deleteUser(userId);
        res.redirect("/");
    } catch (error) {
        res.status(500).send("Error deleting user");
    }
};

module.exports = { renderHome, addUser, deleteUser };
