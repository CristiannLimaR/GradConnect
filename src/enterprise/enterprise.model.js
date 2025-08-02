import { Schema, model } from "mongoose";
import autopopulate from "mongoose-autopopulate";

const enterpriseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 200,
    },
    logo: {
      type: String,
    },
    webSite: {
      type: String,
      default: "",
      match: /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/,
    },
    address: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
      required: true,
      enum: [
        "Technology",
        "Health",
        "Education",
        "Finance",
        "Retail",
        "Manufacturing",
        "Hospitality",
        "Construction",
        "Others",
      ],
    },
    contactNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /.+\@.+\..+/,
    },
    socialMediaLinks: [
      {
        type: String,
        match: /^(https?:\/\/)(www\.)?[\w\-]+\.[a-z]{2,}([\/\w\-.?=&#%]*)*$/i,
      },
    ],
    type: {
      type: String,
      required: true,
      enum: ["Startup", "SME", "Corporation", "Non-Profit"],
    },
    size: {
      type: String,
      required: true,
      enum: ["Small", "Medium", "Large"],
    },
    recruiters: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        autopopulate: true,
      },
    ],
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

enterpriseSchema.plugin(autopopulate);

enterpriseSchema.methods.toJSON = function () {
  const { __v, _id, ...enterprise } = this.toObject();
  enterprise.id = _id;
  return enterprise;
};

export default model("Enterprise", enterpriseSchema);
