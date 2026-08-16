const mongoose = require('mongoose');

const TASK_STATUSES = ['todo', 'in_progress', 'in_review', 'done'];
const TASK_PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const TASK_CATEGORIES = ['development', 'design', 'marketing', 'administration', 'support', 'research'];

function subdocToJSON(fieldMap) {
  return {
    transform: (_doc, ret) => {
      ret.id = String(ret._id);
      Object.entries(fieldMap).forEach(([from, to]) => {
        ret[to] = ret[from] ? String(ret[from]) : ret[from];
        delete ret[from];
      });
      delete ret._id;
      return ret;
    },
  };
}

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
commentSchema.set('toJSON', subdocToJSON({ author: 'authorId' }));

const attachmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    sizeKb: { type: Number, required: true, min: 0 },
    type: { type: String, required: true, trim: true, maxlength: 100 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: 'uploadedAt', updatedAt: false } }
);
attachmentSchema.set('toJSON', subdocToJSON({ uploadedBy: 'uploadedById' }));

const historySchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true, trim: true, maxlength: 50 },
    detail: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
historySchema.set('toJSON', subdocToJSON({ actor: 'actorId' }));

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: 'todo',
    },
    priority: {
      type: String,
      enum: TASK_PRIORITIES,
      default: 'medium',
    },
    category: {
      type: String,
      enum: TASK_CATEGORIES,
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    comments: {
      type: [commentSchema],
      default: [],
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    history: {
      type: [historySchema],
      default: [],
    },
  },
  { timestamps: true }
);

taskSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.assigneeId = ret.assignee ? String(ret.assignee) : null;
    ret.creatorId = String(ret.creator);
    delete ret.assignee;
    delete ret.creator;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Task', taskSchema);
module.exports.TASK_STATUSES = TASK_STATUSES;
module.exports.TASK_PRIORITIES = TASK_PRIORITIES;
module.exports.TASK_CATEGORIES = TASK_CATEGORIES;
