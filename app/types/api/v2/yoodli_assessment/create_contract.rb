# frozen_string_literal: true

module Api
  module V2
    module YoodliAssessment
      class CreateContract < Api::Base::Contract
        config.messages.namespace = :yoodli_assessment_create

        schema Api::V2::YoodliAssessment::Schema.create_request

        rule(data: { attributes: :name }) do
          key.failure(:filled?) if key? && value.blank?
        end

        rule(data: { attributes: :product_id }) do
          key.failure(:filled?) if key? && value.blank?
        end

        rule(data: { attributes: :product_id }) do
          project_id = _context[:project]&.id

          record = ::YoodliAssessment.find_by(project_id: project_id, product_id: value)
          key.failure(:uniq_product_id) if record.present?
        end
      end
    end
  end
end
