import mongoose from 'mongoose';
import autopopulate from 'mongoose-autopopulate';

const educationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        autopopulate: true
    },
    institution: {
        type: String,
        required: true
    },
    degree: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

educationSchema.plugin(autopopulate);

const Education = mongoose.model('Education', educationSchema);

export default Education;


