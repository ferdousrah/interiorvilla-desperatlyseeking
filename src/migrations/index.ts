import * as migration_20260708_135534_initial from './20260708_135534_initial';

export const migrations = [
  {
    up: migration_20260708_135534_initial.up,
    down: migration_20260708_135534_initial.down,
    name: '20260708_135534_initial'
  },
];
