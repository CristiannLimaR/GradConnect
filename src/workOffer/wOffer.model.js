import { Schema, model } from "mongoose";
import autopopulate from 'mongoose-autopopulate';

const wOfferSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    enterprise: {
      type: Schema.Types.ObjectId,
      ref: 'Enterprise',
      required: true,
      autopopulate: true,
    },
    location: {
      type: String,
      required: true,
      enum: ["Remoto", "Presencial", "Hibrido"],
    },
    modality: {
      type: String,
      required: true,
      enum: ["Tiempo Completo", "Medio Tiempo", "Freelance"],
    },
    salary: {
      type: Number,
      required: true,
    },
    ubication: {
      type: String,
      required: true,
    },
    requirements: {
      type: [String],
      required: true,
    },
    closingDate: {
      type: Date,
      required: true,
    },
    skills: {
      type: [Schema.Types.ObjectId],
      ref: "Skill",
      required: true,
    },
    applications: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        autopopulate: true,
      },
    ],
    isApplicated: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

wOfferSchema.methods.toJSON = function () {
  const { __v, _id, ...wOffer } = this.toObject();
  wOffer.id = _id;
  return wOffer;
};

wOfferSchema.plugin(autopopulate);
export default model('wOffer', wOfferSchema)