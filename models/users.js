const mongoose = require('mongoose')

const User = mongoose.model('users', {
    username: String,
    email: String,
    password: String
});

const RoleUserModel = mongoose.model('usersRole', {
    username: String,
    email: String,
    role: String,
    password: String
})

RoleUserModel.schema.add({
    newUsername: String,
});


module.exports = {
    User,
    RoleUserModel
}