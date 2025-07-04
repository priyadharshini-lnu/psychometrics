# frozen_string_literal: true

module Api
  module V2
    module IdpTemplate
      class UpdateInstructionsContract < Api::Base::Contract
        config.messages.namespace = :idp_template

        rule(data: { attributes: :instructions }) do
          if value.is_a?(Hash) && value[:content].blank?
            key.failure(:content_required)
          end
        end
      end
    end
  end
end
