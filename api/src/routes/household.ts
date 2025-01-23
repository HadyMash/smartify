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

householdRouter.get('/memberships');

//householdRouter.get();

//householdRouter.delete('/:id', HouseholdController.deleteHousehold);
