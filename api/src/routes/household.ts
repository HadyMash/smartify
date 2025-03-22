import { Router } from 'express';
import { HouseholdController } from '../controllers/household';
import { requireAuth } from '../middleware/auth';

export const householdRouter = Router();

householdRouter.use(requireAuth);

householdRouter.post('/new', (req, res) =>
  HouseholdController.createHousehold(req, res),
);

householdRouter.get('/:householdId', (req, res) =>
  HouseholdController.getHousehold(req, res),
);

householdRouter.post('/:householdId/invite', (req, res) =>
  HouseholdController.inviteMember(req, res),
);

householdRouter.post('/:householdId/remove-member', (req, res) =>
  HouseholdController.removeMember(req, res),
);

householdRouter.delete('/:householdId', (req, res) =>
  HouseholdController.deleteHousehold(req, res),
);

householdRouter.put('/:householdId/rooms', (req, res) =>
  HouseholdController.updateRooms(req, res),
);

householdRouter.get('/:householdId/info', (req, res) =>
  HouseholdController.getHouseholdInfo(req, res),
);

householdRouter.patch('/:householdId/change-permissions', (req, res) =>
  HouseholdController.changeUserPermissions(req, res),
);

householdRouter.post('/invite/respond', (req, res) =>
  HouseholdController.respondToInvite(req, res),
);

householdRouter.get('/invites', (req, res) =>
  HouseholdController.getUserInvites(req, res),
);

householdRouter.get('/households', (req, res) =>
  HouseholdController.getUserHouseholds(req, res),
);

householdRouter.post('/:householdId/leave', (req, res) =>
  HouseholdController.leaveHousehold(req, res),
);
