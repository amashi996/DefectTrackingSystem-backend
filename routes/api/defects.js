const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('config');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const upload = require('../../middleware/uploadMiddleware');

const Defect = require('../../models/Defect');
const User = require('../../models/User');
const Project = require('../../models/Project');
const checkObjectID = require('../../middleware/checkObjectId');

// @route   GET api/defects/
// @desc    Test Screen
// @access  Public
router.get('/test-def', (req,res) => res.json({
    msg: 'Defects Works'
}));

// @route   POST api/defects/createDefect
// @desc    Create a defect
// @access  Private
router.post(
    '/createDefect', 
    [
        auth, 
        check('projectId', 'Project ID is required').notEmpty(),
        check('defectTitle', 'Defect title is required').notEmpty(),
        check('defectDescription', 'Defect description is required').notEmpty(),
        check('defectStatus', 'Defect status is required').isIn(["New", "In Progress", "Resolved", "Failed", "Closed", "Reopen"]),
        check('defectPriority', 'Defect priority is required').isIn(["High", "Medium", "Low"]),
        check('defectSeverity', 'Defect severity is required').isIn(["Critical", "Major", "Minor", "Cosmetic"]),
        check('reproduceSteps', 'Reproduce steps are required').notEmpty(),
        check('expectedResult', 'Expected result is required').notEmpty(),
        check('actualResult', 'Actual result is required').notEmpty(),
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            // Identify the project title based on the project ID
            const project = await Project.findById(req.body.projectId);
            if (!project) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Project ID' }] });
            }

            // Get the authenticated user
            const user = await User.findById(req.user.id).select('-password');

            // Create the defect
            const newDefect = new Defect({
                projectId: req.body.projectId,
                projectTitle: project.projectName,
                defectTitle: req.body.defectTitle,
                defectDescription: req.body.defectDescription,
                defectStatus: req.body.defectStatus,
                defectPriority: req.body.defectPriority,
                defectSeverity: req.body.defectSeverity,
                reportedBy: user.id, // Assign reportedBy from authenticated user
                assignedTo: req.body.assignedTo, // Assuming assignedTo also from authenticated user
                reproduceSteps: req.body.reproduceSteps,
                expectedResult: req.body.expectedResult,
                actualResult: req.body.actualResult,
            });

            // Save the defect
            await newDefect.save();

            res.json(newDefect);
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    }
);

// @route   PUT api/defects/updateDefect/:defectId
// @desc    Update basic defect details
// @access  Private
router.put(
    '/updateDefect/:defectId',
    [
        auth,
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { projectId, defectTitle, defectDescription, defectPriority, defectSeverity, reproduceSteps, expectedResult, actualResult } = req.body;

        try {
            const defect = await Defect.findById(req.params.defectId);

            if (!defect) {
                return res.status(404).json({ msg: 'Defect not found' });
            }

            // Update defect fields if they exist in the request body
            if (projectId) defect.projectId = projectId;
            if (defectTitle) defect.defectTitle = defectTitle;
            if (defectDescription) defect.defectDescription = defectDescription;
            if (defectPriority) defect.defectPriority = defectPriority;
            if (defectSeverity) defect.defectSeverity = defectSeverity;
            if (reproduceSteps) defect.reproduceSteps = reproduceSteps;
            if (expectedResult) defect.expectedResult = expectedResult;
            if (actualResult) defect.actualResult = actualResult;
            defect.modifiedDate = new Date();

            await defect.save();

            res.json(defect);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   PUT api/defects/updateStatus/:defectId
// @desc    Update defect status
// @access  Private
router.put(
    '/updateStatus/:defectId',
    [
        auth,
        check('defectStatus', 'Defect status is required').isIn(["New", "In Progress", "Resolved", "Failed", "Closed", "Reopen"])
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { defectStatus } = req.body;

        try {
            const defect = await Defect.findById(req.params.defectId);

            if (!defect) {
                return res.status(404).json({ msg: 'Defect not found' });
            }

            // Update defect status
            defect.defectStatus = defectStatus;
            
            if (defectStatus === "Resolved") {
                // Update resolvedDate to current date if status is "Resolved"
                defect.resolvedDate = new Date();
            }

            if (defectStatus === "Closed") {
                // Update resolvedDate to current date if status is "Resolved"
                defect.closedDate = new Date();
            }

            // Update modifiedDate regardless of status change
            defect.modifiedDate = new Date();

            await defect.save();

            res.json(defect);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   PUT api/defects/updateAssignedTo/:defectId
// @desc    Update assignedTo field of a defect
// @access  Private
router.put(
    '/updateAssignedTo/:defectId',
    [
        auth,
        check('assignedTo', 'AssignedTo user ID is required').notEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { assignedTo } = req.body;

        try {
            const defect = await Defect.findById(req.params.defectId);

            if (!defect) {
                return res.status(404).json({ msg: 'Defect not found' });
            }

            // Update assignedTo field
            defect.assignedTo = assignedTo;
            defect.modifiedDate = new Date();

            await defect.save();

            res.json(defect);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   GET api/defects/allDefects
// @desc    View all defects
// @access  Private
router.get('/allDefects', auth, async (req, res) => {
    try {
        // Retrieve all defects
        const defects = await Defect.find();
        res.json(defects);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/defects/defect/:defectId
// @desc    View a selected defect
// @access  Private
router.get('/defect/:defectId', auth, async (req, res) => {
    try {
        // Retrieve the selected defect
        const defect = await Defect.findById(req.params.defectId);
        
        if (!defect) {
            return res.status(404).json({ msg: 'Defect not found' });
        }

        res.json(defect);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Defect not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   POST api/defects/uploadAttachments/:defectId
// @desc    Upload attachments for a defect
// @access  Private
router.post(
    '/uploadAttachments/:defectId',
    [auth, upload.array('defectAttachment')],
    async (req, res) => {
      try {
        const defect = await Defect.findById(req.params.defectId);
  
        if (!defect) {
          return res.status(404).json({ msg: 'Defect not found' });
        }

        // Assuming defectAttachment is an array
        const files = req.files.map(file => ({
          fileName: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          url: `../../uploads/defects/${file.filename}`, 
        }));
  
        defect.defectAttachment.push(...files);
        await defect.save();
  
        res.json({ defectId: defect._id, attachedFiles: files });
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  );

// @route   DELETE api/defects/deleteAttachment/:defectId/:attachmentId
// @desc    Delete a single attachment from a defect
// @access  Private
router.delete(
    '/deleteAttachment/:defectId/:attachmentId',
    auth,
    async (req, res) => {
        try {
            const defect = await Defect.findById(req.params.defectId);

            if (!defect) {
                return res.status(404).json({ msg: 'Defect not found' });
            }

            // Find the attachment by ID
            const attachment = defect.defectAttachment.find(attachment => attachment._id.toString() === req.params.attachmentId);

            if (!attachment) {
                return res.status(404).json({ msg: 'Attachment not found' });
            }

            // Remove the attachment from the defect
            defect.defectAttachment = defect.defectAttachment.filter(att => att._id.toString() !== req.params.attachmentId);

            await defect.save();

            // Delete the attachment file from the uploads folder
            const filePath = path.join(__dirname, '../../uploads/defects/', attachment.fileName);
            fs.unlinkSync(filePath); // Synchronously delete the file

            res.json({ msg: 'Attachment deleted successfully' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   DELETE api/defects/deleteAllAttachments/:defectId
// @desc    Delete all attachments of a defect
// @access  Private
router.delete('/deleteAllAttachments/:defectId', auth, async (req, res) => {
    try {
        const defect = await Defect.findById(req.params.defectId);

        if (!defect) {
            return res.status(404).json({ msg: 'Defect not found' });
        }

        // Delete all attachment files from the uploads folder
        defect.defectAttachment.forEach(attachment => {
            const filePath = path.join(__dirname, '../../uploads/defects/', attachment.fileName);
            fs.unlinkSync(filePath); // Synchronously delete the file
        });

        // Clear all attachments
        defect.defectAttachment = [];

        await defect.save();

        res.json({ msg: 'All attachments deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/defects/viewAttachment/:defectId/:attachmentId
// @desc    View details of a single attachment from a defect
// @access  Private
router.get(
    '/viewAttachment/:defectId/:attachmentId',
    auth,
    async (req, res) => {
        try {
            const defect = await Defect.findById(req.params.defectId);

            if (!defect) {
                return res.status(404).json({ msg: 'Defect not found' });
            }

            // Find the attachment by ID
            const attachment = defect.defectAttachment.find(attachment => attachment._id.toString() === req.params.attachmentId);

            if (!attachment) {
                return res.status(404).json({ msg: 'Attachment not found' });
            }

            res.json(attachment);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   GET api/defects/viewAttachments/:defectId
// @desc    View details of all attachments from a defect
// @access  Private
router.get(
    '/viewAttachments/:defectId',
    auth,
    async (req, res) => {
        try {
            const defect = await Defect.findById(req.params.defectId);

            if (!defect) {
                return res.status(404).json({ msg: 'Defect not found' });
            }

            res.json(defect.defectAttachment);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   GET api/defects/downloadAttachment/:defectId/:attachmentId
// @desc    Download a single attachment from a defect
// @access  Private
router.get('/downloadAttachment/:defectId/:attachmentId', auth, async (req, res) => {
    try {
        const defect = await Defect.findById(req.params.defectId);

        if (!defect) {
            return res.status(404).json({ msg: 'Defect not found' });
        }

        // Find the attachment by ID
        const attachment = defect.defectAttachment.find(attachment => attachment._id.toString() === req.params.attachmentId);

        if (!attachment) {
            return res.status(404).json({ msg: 'Attachment not found' });
        }

        // Construct the file path
        const filePath = path.join(__dirname, '../../uploads/defects/', attachment.fileName);

        // Set the appropriate headers for file download
        res.setHeader('Content-Disposition', `attachment; filename=${attachment.fileName}`);
        res.setHeader('Content-Type', attachment.mimetype);

        // Stream the file for download
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/defects/downloadAttachments/:defectId
// @desc    Download multiple attachments from a defect as a zip file
// @access  Private
router.get('/downloadAttachments/:defectId', auth, async (req, res) => {
    try {
        const defect = await Defect.findById(req.params.defectId);

        if (!defect) {
            return res.status(404).json({ msg: 'Defect not found' });
        }

        // Get the list of attachment IDs from the query parameters
        const attachmentIds = req.query.attachmentIds;

        if (!attachmentIds || attachmentIds.length === 0) {
            return res.status(400).json({ msg: 'Attachment IDs must be provided as an array' });
        }

        // Create a zip file
        const zipFileName = `attachments_${defect._id}.zip`;
        const zipFilePath = path.join(__dirname, '..', '..', 'temp', zipFileName);
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Compression level
        });

        // Pipe the zip stream to the response
        output.on('close', () => {
            res.setHeader('Content-Disposition', `attachment; filename=${zipFileName}`);
            res.setHeader('Content-Type', 'application/zip');
            res.sendFile(zipFilePath);
        });

        archive.on('error', err => {
            console.error(err);
            res.status(500).send('Server Error');
        });

        archive.pipe(output);

        // Add selected attachments to the zip file
        const selectedAttachments = defect.defectAttachment.filter(attachment => attachmentIds.includes(attachment._id.toString()));
        selectedAttachments.forEach(attachment => {
            const filePath = path.join(__dirname, '..', '..', 'uploads/defects/', attachment.fileName);
            archive.file(filePath, { name: attachment.fileName });
        });

        // Finalize the zip file
        archive.finalize();
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;


