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
import * as migration_20260619_062646 from './20260619_062646';
import * as migration_20260624_155344_homepage_cruises_search_messenger from './20260624_155344_homepage_cruises_search_messenger';
import * as migration_20260627_123741_tour_enrichment_fields from './20260627_123741_tour_enrichment_fields';
import * as migration_20260628_090000_comment_author_name from './20260628_090000_comment_author_name';
import * as migration_20260628_180000_post_author_viewcount from './20260628_180000_post_author_viewcount';
import * as migration_20260628_193000_comment_rating_guest from './20260628_193000_comment_rating_guest';
import * as migration_20260628_200000_blog_media from './20260628_200000_blog_media';
import * as migration_20260629_095204_faqs_tour_field from './20260629_095204_faqs_tour_field';
import * as migration_20260629_161614_search_form_fields from './20260629_161614_search_form_fields';

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
    name: '20260531_010452_site_settings_features',
  },
  {
    up: migration_20260531_232000_disable_ota_defaults.up,
    down: migration_20260531_232000_disable_ota_defaults.down,
    name: '20260531_232000_disable_ota_defaults',
  },
  {
    up: migration_20260619_062646.up,
    down: migration_20260619_062646.down,
    name: '20260619_062646',
  },
  {
    up: migration_20260624_155344_homepage_cruises_search_messenger.up,
    down: migration_20260624_155344_homepage_cruises_search_messenger.down,
    name: '20260624_155344_homepage_cruises_search_messenger',
  },
  {
    up: migration_20260627_123741_tour_enrichment_fields.up,
    down: migration_20260627_123741_tour_enrichment_fields.down,
    name: '20260627_123741_tour_enrichment_fields',
  },
  {
    up: migration_20260628_090000_comment_author_name.up,
    down: migration_20260628_090000_comment_author_name.down,
    name: '20260628_090000_comment_author_name',
  },
  {
    up: migration_20260628_180000_post_author_viewcount.up,
    down: migration_20260628_180000_post_author_viewcount.down,
    name: '20260628_180000_post_author_viewcount',
  },
  {
    up: migration_20260628_193000_comment_rating_guest.up,
    down: migration_20260628_193000_comment_rating_guest.down,
    name: '20260628_193000_comment_rating_guest',
  },
  {
    up: migration_20260628_200000_blog_media.up,
    down: migration_20260628_200000_blog_media.down,
    name: '20260628_200000_blog_media',
  },
  {
    up: migration_20260629_095204_faqs_tour_field.up,
    down: migration_20260629_095204_faqs_tour_field.down,
    name: '20260629_095204_faqs_tour_field',
  },
  {
    up: migration_20260629_161614_search_form_fields.up,
    down: migration_20260629_161614_search_form_fields.down,
    name: '20260629_161614_search_form_fields'
  },
];
