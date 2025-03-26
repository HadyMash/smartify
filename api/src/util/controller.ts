import { Response } from 'express';
import { log } from './log';

/**
 * Try's to run a controller, and sends a 500 response if it fails.
 * @param res - The response object
 * @param controller - the controller to run
 * @param customErrorHandling - A function to add custom error handling. It
 * returns a true if the error was handled, and false otherwise. This function
 * will be called before the default error handling.
 */

export function tryAPIController(
  res: Response,
  controller: () => Promise<void>,
  customErrorHandling?: (err: unknown) => boolean,
) {
  const handleError = (err: unknown) => {
    if (customErrorHandling && customErrorHandling(err)) {
      return;
    }
    log.error('err caught in tryAPIController');
    log.error(err);
    res.status(500).send({ error: 'Internal Server Error' });
  };
  try {
    controller().catch(handleError);
  } catch (e) {
    handleError(e);
  }
}
