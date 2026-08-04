import { handleItunesSearchRequest } from '../../server/itunesGateway';

export function GET(request: Request) {
  return handleItunesSearchRequest(request);
}
