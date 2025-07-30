import {Schema, model} from 'mongoose';
import autopopulate from 'mongoose-autopopulate';

const experienceSchema = new Schema(
    {
       user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
       },
       title: {
        type: String,
        required: [true, "Title is required"],
        maxLength: 100,
       },
       company: {
        type: String,
        required: [true, "Company is required"],
        maxLength: 100,
       },
       startDate: {
        type: Date,
        required: [true, "Start date is required"],
       },
       endDate: {
        type: Date,
        required: false,
       },
       isCurrent: {
        type: Boolean,
        default: false,
       },
       description: {
        type: String,
        required: [true, "Description is required"],
        maxLength: 500,
       },
    },
    {
       timestamps: true,
       versionKey: false,
    }
);

experienceSchema.methods.toJSON = function () {
    const { __v, _id, ...experience } = this.toObject();
    experience.id = _id;
    return experience;
}

experienceSchema.plugin(autopopulate);

export default model('Experience', experienceSchema);

