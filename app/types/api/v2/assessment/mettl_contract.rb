# frozen_string_literal: true

module Api
  module V2
    module Assessment
      class MettlContract < Api::Base::Contract
        rule(data: { attributes: :category }) do
          next unless value

          list = [::Assessment::METTL]
          key.failure(:included_in?, list: list) unless list.include?(value)
        end

        rule(data: { attributes: { external_settings: :assessment_id } }) do
          next key.failure(:filled?) unless value

          project_id = values.dig(:data, :relationships, :project, :data, :id)
          assessments = MettlAssessment.where(project_id: project_id)
          key.failure(:not_in_the_list?) unless assessments.exists?(product_id: value)
        end
      end
    end
  end
end
