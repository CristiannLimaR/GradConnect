import { Schema, model } from 'mongoose';
import autopopulate from 'mongoose-autopopulate';

const skillSchema = new Schema(
    {
        nameSkill: {
            type: String,
            required: [true, "Skill name is required"],
            trim: true,
            maxLength: 100
        },
        levelSkill: {
            type: String,
            enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
            default: "BEGINNER"
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            autopopulate: true
        },
        status:{
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
)

skillSchema.plugin(autopopulate);

export default model('Skill', skillSchema);