# frozen_string_literal: true

# Be sure to restart your server when you modify this file.

# same_site: 'None' and secure: true is required for assessment to work in an iframe
secure = Settings.protocol == 'https'
Rails.application.config.session_store :cookie_store, key: '_psychometrics2_session', tld_length: 2,
    same_site: 'Lax', secure: secure
