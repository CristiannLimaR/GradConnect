import { Schema, model } from 'mongoose';
import autopopulate from 'mongoose-autopopulate';

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      maxLength: 40,
      trim: true
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: 8
    },
    role: {
      type: String,
      required: true,
      enum: ["CANDIDATE", "RECRUITER", "GRADCONNECT"],
      default: "CANDIDATE"
    },
    location: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    profilePhoto: {
      type: String, // URL
      trim: true
    },
    linkedinUrl: {
      type: String,
      trim: true
    },
    github: {
      type: String,
      trim: true
    },
    descripcion: {
      type: String,
      trim: true,
      maxLength: 500
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    cvAdjunto: {
      type: String,
      trim: true
    },
    skills: [
      {
        skillId: {
          type: Schema.Types.ObjectId,
          ref: 'Skill',
          required: true
        },
        levelSkill: {
          type: String,
          enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
          default: "BEGINNER"
        },
        addedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    status: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Personalización del objeto retornado
userSchema.methods.toJSON = function () {
  const { __v, password, _id, ...user } = this.toObject();
  user.id = _id;
  return user;
};

userSchema.plugin(autopopulate);

export default model('User', userSchema);
