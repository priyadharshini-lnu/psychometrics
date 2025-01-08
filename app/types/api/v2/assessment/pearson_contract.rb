# frozen_string_literal: true

module Api
  module V2
    module Assessment
      class PearsonContract < Api::Base::Contract
        rule(data: { attributes: :category }) do
          next unless value

          list = [::Assessment::PEARSON]
          key.failure(:included_in?, list: list) unless list.include?(value)
        end

        rule(data: { attributes: { external_settings: :assessment_id } }) do
          key.failure(:filled?) unless value

          key.failure(:not_in_the_list?) unless PearsonAssessment.order(:title).exists?(product_id: value)
        end

        rule(data: { attributes: { external_settings: :norm_id } }) do
          assessment_id = values.dig(:data, :attributes, :external_settings, :assessment_id)
          available_norms = PearsonAssessment.find_by(product_id: assessment_id)&.norms&.dig('items')

          next if available_norms.blank?

          next key.failure(:filled?) unless value

          norm = (Assessments::PearsonSettings.norms(assessment_id) || []).find do |a|
            a[:id] == value
          end

          key.failure(:not_in_the_list?) unless norm
        end
      end
    end
  end
end
