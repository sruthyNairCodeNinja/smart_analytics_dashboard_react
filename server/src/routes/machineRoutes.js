const express = require('express');
const {
  listMachines,
  getMachine,
  createMachine,
  updateMachine,
  deleteMachine,
} = require('../controllers/machineController');
const { getReadingsForMachine } = require('../controllers/readingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', listMachines);
router.post('/', authorize('admin'), createMachine);
router.get('/:id', getMachine);
router.put('/:id', authorize('admin'), updateMachine);
router.delete('/:id', authorize('admin'), deleteMachine);
router.get('/:id/readings', getReadingsForMachine);

module.exports = router;
