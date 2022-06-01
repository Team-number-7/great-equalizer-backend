import container, { mongoContainer } from '../inversify.config';

// container.load(mongoContainer);

function bindDependencies(func: Function, dependencies: Array<any>) {
  const injections = dependencies.map((dependency: any) => container.get(dependency));
  return func.bind(func, ...injections);
}

export default bindDependencies;
