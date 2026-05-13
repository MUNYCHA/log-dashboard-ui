import { UserManager } from 'oidc-client-ts';
import config from '../config';

const userManager = config.sso.enabled
  ? new UserManager({
      authority: config.sso.authority,
      client_id: config.sso.clientId,
      redirect_uri: window.location.origin,
      post_logout_redirect_uri: window.location.origin,
      scope: 'openid profile',
      response_type: 'code',
    })
  : null;

export default userManager;
