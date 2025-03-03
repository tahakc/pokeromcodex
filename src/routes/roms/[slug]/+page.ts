import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends, data }) => {
  // Register dependency for collection state changes
  depends('app:collection');
  
  // Return the server data unmodified
  return data;
};
