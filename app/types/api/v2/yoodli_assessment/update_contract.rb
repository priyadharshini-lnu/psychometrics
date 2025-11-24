# frozen_string_literal: true

module Api
  module V2
    module YoodliAssessment
      class UpdateContract < Api::Base::Contract
        config.messages.namespace = :yoodli_assessment_update

        schema Api::V2::YoodliAssessment::Schema.update_request

        rule(data: { attributes: :name }) do
          key.failure(:filled?) if key? && value.blank?
        end

        rule(data: { attributes: :product_id }) do
          key.failure(:filled?) if key? && value.blank?
        end
      end
    end
  end
end
