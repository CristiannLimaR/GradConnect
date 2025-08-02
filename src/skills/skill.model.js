import { Schema, model } from 'mongoose';

const skillSchema = new Schema(
    {
        nameSkill: {
            type: String,
            required: [true, "Skill name is required"],
            trim: true,
            maxLength: 100,
            unique: true
        },
        levelSkill: {
            type: String,
            enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
            default: "BEGINNER"
        },
        category: {
            type: String,
            enum: ["TECHNICAL", "ARCHITECTURE", "FINANCE", "SALES", "HEALTH", "OTHER"],
            default: "TECHNICAL"
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

export default model('Skill', skillSchema);