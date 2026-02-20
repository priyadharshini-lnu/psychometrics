# frozen_string_literal: true

module Api
  module V2
    module Assessment
      class YoodliContract < Api::Base::Contract
        rule(data: { attributes: :category }) do
          next unless value

          list = [::Assessment::YOODLI]
          key.failure(:included_in?, list: list) unless list.include?(value)
        end

        rule(data: { attributes: { external_settings: :assessment_id } }) do
          next unless value

          project_id = values.dig(:data, :relationships, :project, :data, :id)

          scope = ::Assessment.yoodli.where(project_id: project_id).where(
            "external_settings->>'assessment_id' = ?", value
          )
          current_id = values.dig(:data, :id)
          scope = scope.where.not(id: current_id) if current_id

          existing_assessment = scope.first
          key.failure(:uniq_yoodli, id: existing_assessment.id) if existing_assessment
        end
      end
    end
  end
end
