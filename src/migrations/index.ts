import * as migration_20260524_061609_initial_baseline from './20260524_061609_initial_baseline';
import * as migration_20260524_160728 from './20260524_160728';
import * as migration_20260525_031218_media_variants from './20260525_031218_media_variants';

export const migrations = [
  {
    up: migration_20260524_061609_initial_baseline.up,
    down: migration_20260524_061609_initial_baseline.down,
    name: '20260524_061609_initial_baseline',
  },
  {
    up: migration_20260524_160728.up,
    down: migration_20260524_160728.down,
    name: '20260524_160728'
  },
  {
    up: migration_20260525_031218_media_variants.up,
    down: migration_20260525_031218_media_variants.down,
    name: '20260525_031218_media_variants',
  },
];
