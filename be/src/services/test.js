
const { User } = require("../models");
 const signUp = async () =>{
    // Tạo user mới
    const newUser = await User.create({
    phone:"0123456789",
    password_hash:"a",
    first_name:"a",
    last_name:"Khải Văn",
    email: "van@example.com",
    });
}

module.exports = { signUp }

