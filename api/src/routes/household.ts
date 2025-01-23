import { Router } from 'express';
import { HouseholdController } from '../controllers/household';
import { requireAuth } from '../middleware/auth';

export const householdRouter = Router();

householdRouter.post('/new', requireAuth, (req, res) =>
  HouseholdController.createHousehold(req, res),
);

householdRouter.get('/:id');

householdRouter.get('/memberships');

//householdRouter.get();

//householdRouter.delete('/:id', HouseholdController.deleteHousehold);
