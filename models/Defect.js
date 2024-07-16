const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DefectSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: "Project"
  },
  projectTitle: {
    type: String,
    required: true // Assuming project title is required for the defect
  },
  defectTitle: {
    type: String,
    required: true,
  },
  defectDescription: {
    type: String,
    required: true,
  },
  defectStatus: {
    type: String,
    enum: ["New", "In Progress", "Resolved", "Failed", "Closed", "Reopen"],
    required: true,
  },
  defectPriority: {
    type: String,
    enum: ["High", "Medium", "Low"],
    required: true,
  },
  defectSeverity: {
    type: String,
    enum: ["Critical", "Major", "Minor", "Cosmetic"],
    required: true,
  },
  reportedBy: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  createdDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  resolvedDate: {
    type: Date,
  },
  closedDate: {
    type: Date,
  },
  modifiedDate:{
    type: Date,
    default: Date.now
  },
  reproduceSteps: {
    type: String,
    required: true,
  },
  expectedResult: {
    type: String,
    required: true,
  },
  actualResult: {
    type: String,
    required: true,
  },
  defectAttachment: [
    {
      fileName: {
        type: String,
        required: true,
      },
      mimetype: {
        type: String,
        required: true,
      },
      size: {
        type: Number,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  /*defectComment: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      defectComment: {
        type: String,
        required: true,
      },
      commentDate: {
        type: Date,
        required: true,
        default: Date.now,
      },
    },
  ],
  commentAttachment: [
    {
      cfileName: {
        type: String,
        required: true,
      },
      cmimetype: {
        type: String,
        required: true,
      },
      csize: {
        type: Number,
        required: true,
      },
      curl: {
        type: String,
        required: true,
      },
    },
  ],*/

  defectComment: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      defectComment: {
        type: String,
        required: true,
      },
      commentDate: {
        type: Date,
        required: true,
        default: Date.now,
      },
      commentAttachment: [
        {
          fileName: {
            type: String,
            required: true,
          },
          mimetype: {
            type: String,
            required: true,
          },
          size: {
            type: Number,
            required: true,
          },
          url: {
            type: String,
            required: true,
          },
        },
      ],
    },
  ],
});


module.exports = mongoose.model("Defect", DefectSchema);
