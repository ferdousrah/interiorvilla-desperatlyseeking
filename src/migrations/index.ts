import * as migration_20260708_135534_initial from './20260708_135534_initial';
import * as migration_20260708_154209_home_footer_sections from './20260708_154209_home_footer_sections';

export const migrations = [
  {
    up: migration_20260708_135534_initial.up,
    down: migration_20260708_135534_initial.down,
    name: '20260708_135534_initial',
  },
  {
    up: migration_20260708_154209_home_footer_sections.up,
    down: migration_20260708_154209_home_footer_sections.down,
    name: '20260708_154209_home_footer_sections'
  },
];
