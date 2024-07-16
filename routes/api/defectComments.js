const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('config');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const upload = require('../../middleware/uploadCAttMiddleware');

const Defect = require('../../models/Defect');
const User = require('../../models/User');


// @route   POST api/addDefComments/:defectId
// @desc    Add comments for the selected defect
// @access  Private
router.post(
    '/addDefComments/:defectId',
    [
        auth,
        check('defectComment', 'Comment is required').notEmpty(),
    ],
    async (req, res) => {
      try {
        const defect = await Defect.findById(req.params.defectId);

        if (!defect) {
            return res.status(404).json({ msg: 'Defect not found' });
        }

        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const { defectComment} = req.body;
  
        const newComment = {
            user: req.user.id,
            defectComment,
            commentDate: Date.now(),
        };

        defect.defectComment.push(newComment);
        await defect.save();

        res.json({ defectId: defect._id, newComment });
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  );

// @route   POST api/defComments/uploadDefAttachments/:defectId/:commentId
// @desc    Upload attachments for a comment in a defect
// @access  Private
router.post(
    '/uploadDefAttachments/:defectId/:commentId',
    [auth, upload.array('commentAttachment')],
    async (req, res) => {
        try {
            const defect = await Defect.findById(req.params.defectId);

            if (!defect) {
                return res.status(404).json({ msg: 'Defect not found' });
            }

            const commentId = req.params.commentId;
            const commentIndex = defect.defectComment.findIndex(comment => comment._id.toString() === commentId);

            if (commentIndex === -1) {
                return res.status(404).json({ msg: 'Comment not found' });
            }

            const comment = defect.defectComment[commentIndex];

            // Check if the current user is the author of the selected comment
            if (comment.user.toString() !== req.user.id) {
                return res.status(401).json({ msg: 'You are not authorized to attach files to this comment' });
            }

            // Initialize commentAttachment if it doesn't exist
            if (!comment.commentAttachment) {
                comment.commentAttachment = [];
            }

            const files = req.files.map(file => ({
                fileName: file.filename,
                mimetype: file.mimetype,
                size: file.size,
                url: `../../uploads/defect_comments/${file.filename}`,
            }));

            // Add attachments to the selected comment
            comment.commentAttachment.push(...files);

            await defect.save();

            res.json({ defectId: defect._id, commentId, attachedFiles: files });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   GET api/defComments/viewDefectComments/:defectId
// @desc    View defect details along with comments and attachments, sorted by creation date
// @access  Private
router.get('/viewDefectComments/:defectId', auth, async (req, res) => {
    try {
      const defect = await Defect.findById(req.params.defectId)
        .populate({
          path: 'defectComment.user',
          select: '-password'
        })
        .sort({ 'defectComment.commentDate': -1 }); // Sort comments by commentDate descending
  
      if (!defect) {
        return res.status(404).json({ msg: 'Defect not found' });
      }
  
      // Map comment attachments URLs to absolute URLs
      const mappedDefect = defect.toObject();
      mappedDefect.defectComment.sort((a, b) => new Date(b.commentDate) - new Date(a.commentDate));
      mappedDefect.defectComment.forEach(comment => {
        comment.commentAttachment.forEach(attachment => {
          attachment.url = `${req.protocol}://${req.get('host')}/uploads/defect_comments/${attachment.fileName}`;
        });
      });
  
      res.json(mappedDefect);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

// @route   GET api/defComments/viewDefectCommentsOnly/:defectId
// @desc    View defect comments and attachments, sorted by creation date
// @access  Private
router.get('/viewDefectCommentsOnly/:defectId', auth, async (req, res) => {
    try {
      const defect = await Defect.findById(req.params.defectId, 'defectComment')
        .populate({
          path: 'defectComment.user',
          select: '-password'
        })
        .sort({ 'defectComment.commentDate': -1 }); // Sort comments by commentDate descending
  
      if (!defect) {
        return res.status(404).json({ msg: 'Defect not found' });
      }
  
      const formattedComments = defect.defectComment.map(comment => ({
        user: comment.user,
        defectComment: comment.defectComment,
        commentDate: comment.commentDate,
        commentAttachment: comment.commentAttachment.map(attachment => ({
          fileName: attachment.fileName,
          mimetype: attachment.mimetype,
          size: attachment.size,
          url: `${req.protocol}://${req.get('host')}/uploads/defect_comments/${attachment.fileName}`,
        })),
      })).sort((a, b) => new Date(b.commentDate) - new Date(a.commentDate));
  
      res.json(formattedComments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  
// @route   DELETE api/defComments/deleteDefectComment/:defectId/:commentId
// @desc    Delete a comment in a defect
// @access  Private
router.delete('/deleteDefectComment/:defectId/:commentId', auth, async (req, res) => {
  try {
    const defect = await Defect.findById(req.params.defectId);

    if (!defect) {
      return res.status(404).json({ msg: 'Defect not found' });
    }

    const commentId = req.params.commentId;
    const commentIndex = defect.defectComment.findIndex(comment => comment._id.toString() === commentId);

    if (commentIndex === -1) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    const comment = defect.defectComment[commentIndex];

    // Check if the current user is the author of the selected comment
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'You are not authorized to delete this comment' });
    }

    defect.defectComment.splice(commentIndex, 1);
    await defect.save();

    res.json({ msg: 'Comment deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
