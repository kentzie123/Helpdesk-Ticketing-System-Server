const mongoose = require('mongoose');

const pagePrivilegeSchema = new mongoose.Schema({
    roleId: { 
        type: Number, 
        required: true 
    },
    page: { 
        type: String, 
        required: true,
        trim: true 
    },
    view: { 
        type: Boolean, 
        default: false 
    },
    create: { 
        type: Boolean, 
        default: false 
    },
    update: { 
        type: Boolean, 
        default: false 
    },
    delete: { 
        type: Boolean, 
        default: false 
    }
}, { 
    collection: 'page_privilege',
    timestamps: true 
});

// Index for faster queries
pagePrivilegeSchema.index({ roleId: 1 });

module.exports = mongoose.model('PagePrivilege', pagePrivilegeSchema);