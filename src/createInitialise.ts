import bindDependencies from './helpers/bindDependencies';
import TYPES from './types';
import { IMongo } from './interfaces';

async function initialise(mongo: IMongo) {
  await mongo.connect();
  await mongo.seed();
}

export default () => bindDependencies(initialise, [TYPES.IMongo]);
