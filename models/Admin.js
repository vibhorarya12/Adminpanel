const mongoose = require('mongoose');
const { Schema } = mongoose;
const AdminSchema = new Schema({
    name:{
        type: String,
        require : true,
        
    },
    email:{
        type: String,
        require : true,
        unique : true
        
    },
    password:{
        type: String,
        require : true,
        
    },
    Date :{
        type: Date,
        default : Date.now
        
    },

  });
  const Admin = mongoose.model('Admin', AdminSchema);
module.exports = Admin;
