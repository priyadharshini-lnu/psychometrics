# frozen_string_literal: true

module Sms
  module Verification
    class VerificationResponse
      include ActiveAttr::Model

      attribute :status
      attribute :error_message
      attribute :verification_code
      attribute :to_mobile_no
    end
  end
end
