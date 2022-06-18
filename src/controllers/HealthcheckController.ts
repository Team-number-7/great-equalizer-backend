import { Request, Response } from 'express';

export default class HealthcheckController {
  public static healthcheck(req: Request, res: Response): void {
    res.send('vsyo ok');
  }
}
