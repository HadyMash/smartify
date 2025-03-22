import { Router } from 'express';
import { HouseholdController } from '../controllers/household';
import { requireAuth } from '../middleware/auth';

export const householdRouter = Router();

householdRouter.use(requireAuth);

householdRouter.post('/new', (req, res) =>
  HouseholdController.createHousehold(req, res),
);

householdRouter.get('/:id', (req, res) =>
  HouseholdController.getHousehold(req, res),
);

householdRouter.post('/:id/invite', (req, res) =>
  HouseholdController.inviteMember(req, res),
);

householdRouter.post('/:id/remove-member', (req, res) =>
  HouseholdController.removeMember(req, res),
);

householdRouter.delete('/:id', (req, res) =>
  HouseholdController.deleteHousehold(req, res),
);

householdRouter.patch('/:id/rooms', (req, res) =>
  HouseholdController.updateRooms(req, res),
);

householdRouter.get('/:id/info', (req, res) =>
  HouseholdController.getHouseholdInfo(req, res),
);

householdRouter.post('/:id/change-permissions', (req, res) =>
  HouseholdController.changeUserPermissions(req, res),
);

householdRouter.post('/invite/:id', (req, res) =>
  HouseholdController.respondToInvite(req, res),
);

householdRouter.get('/invites', (req, res) =>
  HouseholdController.getUserInvites(req, res),
);

householdRouter.get('/households', requireAuth, (req, res) =>
  HouseholdController.getUserHouseholds(req, res),
);

// TODO: add leave household
//householdRouter.post('/:id/leave', (req, res) =>
