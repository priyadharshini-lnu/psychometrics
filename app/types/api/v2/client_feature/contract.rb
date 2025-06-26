# frozen_string_literal: true

module Api
  module V2
    module ClientFeature
      class Contract < Api::Base::Contract
        config.messages.namespace = :client_feature
        schema Api::V2::ClientFeature::Schema.update_request

        rule(data: { attributes: %i[ai_assistants ai_assisted_idp] }) do
          if values.dig(:data, :attributes,
                        :ai_assistants) == false && values.dig(:data, :attributes, :ai_assisted_idp) == true
            key.failure(:ai_assisted_idp_feature_error)
          end
        end
      end
    end
  end
end
