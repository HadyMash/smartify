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

householdRouter.post('/:id/rooms', (req, res) =>
  HouseholdController.addRoom(req, res),
);

householdRouter.get('/:id/info', (req, res) =>
  HouseholdController.getHouseholdInfo(req, res),
);

householdRouter.post('/:id/change-permissions', (req, res) =>
  HouseholdController.changeUserPermissions(req, res),
);

householdRouter.post('/:id/manage-rooms', (req, res) =>
  HouseholdController.manageRooms(req, res),
);

householdRouter.post('/:id/remove-room', (req, res) =>
  HouseholdController.removeRoom(req, res),
);
