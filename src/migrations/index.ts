import * as migration_20260206_110835_add_google_reviews from './20260206_110835_add_google_reviews';

export const migrations = [
  {
    up: migration_20260206_110835_add_google_reviews.up,
    down: migration_20260206_110835_add_google_reviews.down,
    name: '20260206_110835_add_google_reviews'
  },
];
