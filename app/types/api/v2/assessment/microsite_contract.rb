# frozen_string_literal: true

module Api
  module V2
    module Assessment
      class MicrositeContract < Api::Base::Contract
        rule(data: { attributes: :category }) do
          next unless value

          list = [::Assessment::MICROSITE]
          key.failure(:included_in?, list: list) unless list.include?(value)
        end

        rule(data: { attributes: { external_settings: :assessment_id } }) do
          next key.failure(:filled?) unless value

          project_id = values.dig(:data, :relationships, :project, :data, :id)
          assessments = MicrositeAssessment.where(project_id: project_id)
          key.failure(:not_in_the_list?) unless assessments.exists?(product_id: value)
        end

        rule(data: { attributes: { external_settings: :assessment_id } }) do
          next unless value

          scope = ::Assessment.microsite.where("external_settings->>'assessment_id' = ?", value)
          current_id = values.dig(:data, :id)
          scope = scope.where.not(id: current_id) if current_id

          existing_assessment = scope.first
          key.failure(:uniq_microsite, id: existing_assessment.id) if existing_assessment
        end

        rule(data: { attributes: { external_settings: :question_mappings } }) do
          next unless value

          mappings = begin
            JSON.parse(value)
          rescue StandardError
            next
          end
          mapped_ids = mappings.values.compact.map(&:to_i).reject(&:zero?)
          next if mapped_ids.empty?

          assessment_id = values.dig(:data, :id)
          next unless assessment_id

          valid_ids = ::Assessment.find(assessment_id).questions.where(id: mapped_ids).pluck(:id)
          invalid_ids = mapped_ids - valid_ids
          key.failure(:invalid_question_ids, ids: invalid_ids.join(', ')) unless invalid_ids.empty?
        end
      end
    end
  end
end
