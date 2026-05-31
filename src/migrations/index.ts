import * as migration_20260524_061609_initial_baseline from './20260524_061609_initial_baseline';
import * as migration_20260524_160728 from './20260524_160728';
import * as migration_20260525_031218_media_variants from './20260525_031218_media_variants';
import * as migration_20260525_033415_layer_1_3_access_hardening from './20260525_033415_layer_1_3_access_hardening';
import * as migration_20260525_041144_fix_media_admin_upload_storage from './20260525_041144_fix_media_admin_upload_storage';
import * as migration_20260526_145531 from './20260526_145531';
import * as migration_20260527_041941 from './20260527_041941';
import * as migration_20260529_124032_travel_platform_expansion from './20260529_124032_travel_platform_expansion';
import * as migration_20260530_140701_navigation_collection from './20260530_140701_navigation_collection';
import * as migration_20260530_163402_site_settings_social from './20260530_163402_site_settings_social';
import * as migration_20260531_010452_site_settings_features from './20260531_010452_site_settings_features';
import * as migration_20260531_232000_disable_ota_defaults from './20260531_232000_disable_ota_defaults';

export const migrations = [
  {
    up: migration_20260524_061609_initial_baseline.up,
    down: migration_20260524_061609_initial_baseline.down,
    name: '20260524_061609_initial_baseline',
  },
  {
    up: migration_20260524_160728.up,
    down: migration_20260524_160728.down,
    name: '20260524_160728',
  },
  {
    up: migration_20260525_031218_media_variants.up,
    down: migration_20260525_031218_media_variants.down,
    name: '20260525_031218_media_variants',
  },
  {
    up: migration_20260525_033415_layer_1_3_access_hardening.up,
    down: migration_20260525_033415_layer_1_3_access_hardening.down,
    name: '20260525_033415_layer_1_3_access_hardening',
  },
  {
    up: migration_20260525_041144_fix_media_admin_upload_storage.up,
    down: migration_20260525_041144_fix_media_admin_upload_storage.down,
    name: '20260525_041144_fix_media_admin_upload_storage',
  },
  {
    up: migration_20260526_145531.up,
    down: migration_20260526_145531.down,
    name: '20260526_145531',
  },
  {
    up: migration_20260527_041941.up,
    down: migration_20260527_041941.down,
    name: '20260527_041941',
  },
  {
    up: migration_20260529_124032_travel_platform_expansion.up,
    down: migration_20260529_124032_travel_platform_expansion.down,
    name: '20260529_124032_travel_platform_expansion',
  },
  {
    up: migration_20260530_140701_navigation_collection.up,
    down: migration_20260530_140701_navigation_collection.down,
    name: '20260530_140701_navigation_collection',
  },
  {
    up: migration_20260530_163402_site_settings_social.up,
    down: migration_20260530_163402_site_settings_social.down,
    name: '20260530_163402_site_settings_social',
  },
  {
    up: migration_20260531_010452_site_settings_features.up,
    down: migration_20260531_010452_site_settings_features.down,
    name: '20260531_010452_site_settings_features'
  },
  {
    up: migration_20260531_232000_disable_ota_defaults.up,
    down: migration_20260531_232000_disable_ota_defaults.down,
    name: '20260531_232000_disable_ota_defaults'
  },
];
