import type * as undici from 'undici';

declare global {
  type RequestInit = undici.RequestInit;
  var fetch: typeof undici.fetch;
  class Request extends undici.Request {}
  class Response extends undici.Response {}
  class Headers extends undici.Headers {}
}
