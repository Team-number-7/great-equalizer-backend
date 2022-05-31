import bindDependencies from './helpers/bindDependencies';
import TYPES from './types';
import { IMongo } from './interfaces';

async function initialise1(mongo: IMongo) {
  await mongo.connect();
  await mongo.seed();
}

const initialise = bindDependencies(initialise1, [TYPES.IMongo]);

export default initialise;
