import { handleItunesSearchRequest } from '../../src/server/itunesGateway';

export default async function handler(request: Request) {
  return handleItunesSearchRequest(request, { includeNetlifyCacheHeader: true });
}

export const config = {
  path: '/api/itunes-search',
};
