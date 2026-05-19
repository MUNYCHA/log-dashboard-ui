import { UserManager, WebStorageStateStore, InMemoryWebStorage } from 'oidc-client-ts';
import config from '../config';

// In-memory token store: a single XSS payload can no longer read the access/refresh
// token from sessionStorage. Tokens are reacquired via silent renew on tab reload.
const inMemoryStore = new InMemoryWebStorage();

const userManager = config.sso.enabled
  ? new UserManager({
      authority: config.sso.authority,
      client_id: config.sso.clientId,
      redirect_uri: window.location.origin,
      post_logout_redirect_uri: window.location.origin,
      scope: 'openid profile',
      response_type: 'code',
      userStore: new WebStorageStateStore({ store: inMemoryStore }),
      automaticSilentRenew: true,
    })
  : null;

export default userManager;
