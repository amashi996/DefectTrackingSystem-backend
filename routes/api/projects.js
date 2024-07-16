const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('config');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const checkObjectId = require('../../middleware/checkObjectId');

const User = require('../../models/User');
const Project = require('../../models/Project');

// @route   GET api/project/test-proj
// @desc    Test Screen
// @access  Public
router.get('/test-proj', (req, res) => res.json({ msg: 'Projects Works' }));

// @route   POST api/project/addProj
// @desc    Add project
// @access  Private (only accessible to users with role='Admin')
router.post(
  '/addProj',
  [
    auth,
    check('projectName', 'Project name is required').notEmpty(),
    check('projectCode', 'Project code is required').notEmpty(),
    check('projectDescription', 'Project description is required').notEmpty(),
    check('from', 'Start date is required').notEmpty(),
  ],
  async (req, res) => {
    // Validate user role
    try {
      const user = await User.findById(req.user.id);

      if (!user || user.userRole !== 'Admin') {
        return res.status(401).json({
          msg: 'Unauthorized. Only Admins have access to add projects',
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
        });
      }

      const {
        projectName,
        projectCode,
        projectDescription,
        from,
        to,
        current,
      } = req.body;

      // Check for duplicate project name or project code
      const existingProjName = await Project.findOne({ projectName });
      if (existingProjName){
        return res.status(400).json ({
          msg: 'Project with the same name already exist',
        });
      }

      const existingProjCode = await Project.findOne({ projectCode });
      if (existingProjCode){
        return res.status(400).json ({
          msg: 'Project with the same code already exist',
        });
      }

      const projectField = {
        user: req.user.id, // Store the user ID of the person who adds the project
        projectName,
        projectCode,
        projectDescription,
        from,
        to,
        current,
      };

      const project = new Project(projectField);
      await project.save();
      res.json(project);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/project/updateProj/:projectId
// @desc    Update project by id
// @access  Private (only accessible to users with role='Admin')
router.put(
  '/updateProj/:projectId',
  [
    auth,
    checkObjectId('projectId'),
    check('projectName').custom(value => {
      if (value) {
        throw new Error('Project name cannot be updated');
      }
      return true;
    }),
    check('projectCode').custom(value => {
      if (value) {
        throw new Error('Project code cannot be updated');
      }
      return true;
    }),
    check('projectDescription', 'Project description is required').notEmpty(),
    check('from', 'Start date is required').notEmpty(),
  ],
  async (req, res) => {
    // Validation user role
    try {
      const user = await User.findById(req.user.id);

      if(!user || user.userRole !== 'Admin'){
        return res.status(401).json ({
          msg: 'Unauthorized. Only Admins have access to update projects',
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
        });
      }

      const {
        projectDescription,
        from,
        to,
        current,
      } = req.body;

      const projectFields = {
        user: req.user.id,
        projectDescription,
        from,
        to,
        current,
      };

      const updatedProject = await Project.findByIdAndUpdate(
        req.params.projectId,
        { $set: projectFields },
        { new: true }
      );

      if (!updatedProject) {
        return res.status(404).json({ msg: 'Project not found' });
      }

      res.json(updatedProject);

    }catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/project/deleteProj/:projectId
// @desc    Delete project by ID
// @access  Private (only accessible to users with role='Admin')
router.delete(
  '/deleteProj/:projectId',
  [auth, checkObjectId('projectId')],
  async (req, res) => {
    // Validate user role
    try {
      const user = await User.findById(req.user.id);

      if (!user || user.userRole !== 'Admin') {
        return res.status(401).json({
          msg: 'Unauthorized. Only Admins have access to delete projects',
        });
      }

      const deletedProject = await Project.findByIdAndDelete(req.params.projectId);

      if (!deletedProject) {
        return res.status(404).json({ msg: 'Project not found' });
      }

      res.json({ msg: 'Project deleted successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);


// @route   POST api/project/addTeamMember/:projectId
// @desc    Add team member to project
// @access  Private (only accessible to users with role='Admin' or 'QA Manager')
router.post(
  '/addTeamMember/:projectId',
  [
    auth,
    checkObjectId('projectId'),
    check('user', 'User is required').exists(),  // Updated validation
    check('teamRole', 'Team role is required').notEmpty(),
    check('from', 'Start date is required').notEmpty(),
  ],
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user || (user.userRole !== 'Admin' && user.userRole !== 'QA Manager')) {
        return res.status(401).json({
          msg: 'Unauthorized. Only Admins and Team Managers have access to add team members',
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
        });
      }

      const project = await Project.findById(req.params.projectId);
      if (!project) {
        return res.status(404).json({
          msg: 'Project not found',
        });
      }

      const { user: teamMemberId, teamRole, from, to, current } = req.body;

      // Check if the user is already a team member
      const isTeamMember = project.teamMembers.some(
        (member) => member.user && member.user.toString() === teamMemberId.toString()
      );

      if (isTeamMember) {
        return res.status(400).json({
          msg: 'User is already a team member for this project',
        });
      }

      const newTeamMember = {
        user: teamMemberId,
        teamRole,
        from,
        to,
        current,
      };

      project.teamMembers.unshift(newTeamMember);
      await project.save();

      res.json(project);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/project/deleteTeamMember/:projectId/:teamMemberId
// @desc    Delete team member by ID from a project
// @access  Private (only accessible to users with role='Admin' or 'QA Manager')
router.delete(
  '/deleteTeamMember/:projectId/:teamMemberId',
  [
    auth,
    checkObjectId('projectId'),
    checkObjectId('teamMemberId'),
  ],
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user || (user.userRole !== 'Admin' && user.userRole !== 'QA Manager')) {
        return res.status(401).json({
          msg: 'Unauthorized. Only Admins and QA Managers have access to delete team members',
        });
      }

      const project = await Project.findById(req.params.projectId);
      if (!project) {
        return res.status(404).json({
          msg: 'Project not found',
        });
      }

      const teamMemberIndex = project.teamMembers.findIndex(
        (teamMember) => teamMember._id.toString() === req.params.teamMemberId
      );

      if (teamMemberIndex === -1) {
        return res.status(404).json({
          msg: 'Team member not found',
        });
      }

      project.teamMembers.splice(teamMemberIndex, 1);
      await project.save();

      res.json({ msg: 'Team member deleted successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    GET api/projects
// @desc     Get all projects
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find().sort({ date: -1 });
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/project/getProj/:projectId
// @desc    Get project by ID
// @access  Public
router.get('/getProj/:projectId', checkObjectId('projectId'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/projects/getTeamMembers/:projectId
// @desc    Get team members of a specific project by ID
// @access  Public
router.get('/getTeamMembers/:projectId', checkObjectId('projectId'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    const teamMembers = project.teamMembers;

    res.json(teamMembers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;


