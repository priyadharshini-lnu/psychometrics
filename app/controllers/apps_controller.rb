# frozen_string_literal: true

class AppsController < BaseController
  include AuthenticateAnonymousUser

  prepend_before_action :authenticate_anonymous_user!

  def global_config
    render json: {
      feature_flags: feature_flags,
      available_locales: I18n.available_locales
    }
  end
end
