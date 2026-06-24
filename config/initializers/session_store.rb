# frozen_string_literal: true

# Be sure to restart your server when you modify this file.

# Session Configuration:
# - Uses DbSessionScoper middleware to route client-admin subdomains
#   to per-subdomain cookie keys (e.g., _psychometrics_saib22_admin_session)
# - Root domain and end-user subdomains share the default key (_psychometrics_session)
# - Sessions are stored in the database (sessions table) instead of cookies
# - This allows:
#   * Querying active sessions for a user
#   * Invalidating sessions server-side
#   * Per-subdomain session isolation for admin portals
#
# same_site: 'Lax' is the secure default. CrossSiteCookies middleware
# upgrades to 'None' only for iframe/proctoring contexts.
secure = Settings.protocol == 'https'
tld_length = Settings.domain == 'localhost' ? 0 : 2

require_relative '../../lib/middlewares/db_session_scoper'

Rails.application.config.session_store Middlewares::DbSessionScoper,
                                       key: '_psychometrics_session',
                                       tld_length: tld_length,
                                       same_site: 'Lax',
                                       secure: secure
