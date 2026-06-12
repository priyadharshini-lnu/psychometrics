# frozen_string_literal: true

module Api
  module V2
    module Assessment
      class CopyContract < Api::Base::Contract
        schema do
          optional(:id)
          required(:data).hash do
            required(:attributes).hash do
              required(:name).filled(:string)
              optional(:external_settings).hash do
                optional(:assessment_id).filled(:string)
              end
            end
            optional(:relationships).hash do
              optional(:project).hash do
                required(:data).hash do
                  required(:id).filled
                end
              end
            end
          end
        end

        rule(data: { attributes: :name }) do
          key.failure(:filled?) if value.strip.blank?
        end

        rule(data: { attributes: :name }) do
          source = ::Assessment.find_by(id: values[:id])
          next unless source

          assessment_id = values.dig(:data, :attributes, :external_settings, :assessment_id)

          if source.microsite? && assessment_id.blank?
            key(%i[data attributes external_settings assessment_id]).failure(:filled?)
          end

          if assessment_id.present? && !(source.common? || source.microsite?)
            key(%i[data attributes external_settings assessment_id]).failure(:not_in_the_list?)
          end
        end

        rule(data: { attributes: { external_settings: :assessment_id } }) do
          next unless value

          project_id = values.dig(:data, :relationships, :project, :data, :id)
          assessments = MicrositeAssessment.where(project_id: project_id)
          key.failure(:not_in_the_list?) unless assessments.exists?(product_id: value)
        end

        rule(data: { attributes: { external_settings: :assessment_id } }) do
          next unless value

          existing_assessment = ::Assessment.microsite.
                                where("external_settings->>'assessment_id' = ?", value).first
          key.failure(:uniq_microsite, id: existing_assessment.id) if existing_assessment
        end
      end
    end
  end
end
