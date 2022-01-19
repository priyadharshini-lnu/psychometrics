# frozen_string_literal: true

module Saml
  class FailedCallbackHandler
    include Rails.application.routes.url_helpers

    def handle(response, startergy)
      return startergy.fail!(response.errors.join(', ')) if response.errors.present?

      startergy.fail!(:saml_user_not_present)
    end
  end
end
