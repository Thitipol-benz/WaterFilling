const mongoose = require('mongoose');

// Connection string for MongoDB Atlas
const uri = "mongodb+srv://thitipolbenz:Qd0zfvZQA35kdDDm@cluster0.yktswjy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// 1. Connect to MongoDB Atlas
mongoose.connect(uri)
    .then(() => console.log("Database Connected Successfully"))
    .catch(err => console.error("Database Connection Error:", err));

// 2. Create Schema
const LoginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

// 3. Create Model
const User = mongoose.model("User", LoginSchema);

// 4. Export User module
module.exports = User;
