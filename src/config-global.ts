import packageJson from '../package.json' assert { type: 'json' };
// ----------------------------------------------------------------------

export type ConfigValue = {
  appName: string;
  appVersion: string;
};

export const CONFIG: ConfigValue = {
  appName: 'Safimayi',
  appVersion: packageJson.version,
};
