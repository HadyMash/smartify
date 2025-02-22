import { Router } from 'express';
import { HouseholdController } from '../controllers/household';
import { requireAuth } from '../middleware/auth';

export const householdRouter = Router();

householdRouter.post('/new', requireAuth, (req, res) =>
  HouseholdController.createHousehold(req, res),
);

householdRouter.get('/:id', (req, res) =>
  HouseholdController.getHousehold(req, res),
);

householdRouter.post('/:id/invite', requireAuth, (req, res) =>
  HouseholdController.inviteMember(req, res),
);

householdRouter.post('/:id/remove-member', requireAuth, (req, res) =>
  HouseholdController.removeMember(req, res),
);

householdRouter.delete('/:id', requireAuth, (req, res) =>
  HouseholdController.deleteHousehold(req, res),
);

householdRouter.post('/:id/rooms', requireAuth, (req, res) =>
  HouseholdController.addRoom(req, res),
);

householdRouter.get('/:id/info', requireAuth, (req, res) =>
  HouseholdController.getHouseholdInfo(req, res),
);

householdRouter.post('/:id/change-permissions', requireAuth, (req, res) =>
  HouseholdController.changeUserPermissions(req, res),
);

householdRouter.post('/:id/manage-rooms', requireAuth, (req, res) =>
  HouseholdController.manageRooms(req, res),
);

householdRouter.post('/:id/remove-room', requireAuth, (req, res) =>
  HouseholdController.removeRoom(req, res),
);
