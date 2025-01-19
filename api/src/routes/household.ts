import { Router } from 'express';
import { HouseholdController } from '../controllers/household';
import { requireAuth } from '../middleware/auth';

export const householdRouter = Router();

householdRouter.post('/new', requireAuth, HouseholdController.createHousehold);

//householdRouter.delete('/:id', HouseholdController.deleteHousehold);
