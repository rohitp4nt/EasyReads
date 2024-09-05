const mongoose = require('mongoose');

const {createHmac , randomBytes} =require('node:crypto');
const {Schema, model} = require('mongoose');
const { createTokensForUser } = require('../services/authentication');

const userSchema = new mongoose.Schema({

    fullName:{
        type: 'String',
        required: true,
    },
    email: {
        type: 'String',
        required: true,
        unique: true,
    },
    salt:{
        type: 'String',
    },
    password:{
        type: 'String',
        required: true,
    },
    profileImgURL:{
        type: 'String',
        default: '/images/default.jpg',
    },
    role:{
        type:'String',
        enum: ["USER", "ADMIN"],
        default: "USER",
    },
    plainPassword: { 
        type: 'String',
    }, 
    
}, {timestamps: true});


userSchema.pre("save", function(next){
    const user = this;
    if(!user.isModified("password")) return ; 


    user.plainPassword = user.password; 

    const salt = randomBytes(16).toString();

    const hashPassword = createHmac('sha256', salt)
                        .update(user.password)
                        .digest('hex');

                        user.password = hashPassword;
                        user.salt = salt;
                    
                        next();
});


userSchema.static('matchPasswordAndGenerateToken', async function(email,password){
  
    const user = await this.findOne({ email }); 
    
    if(!user) throw new Error('User not found');
    
    const salt =user.salt;
    const hashedPassword = user.password;

    console.log("passwords hai:", password);

    const userProvidedhash = createHmac('sha256', salt)
    .update(password)
    .digest('hex');
    
    if(hashedPassword !== userProvidedhash) throw new Error('incorrect password');

    const token = createTokensForUser(user);
    return token;
})
 
const User = model('user', userSchema);

module.exports = User;