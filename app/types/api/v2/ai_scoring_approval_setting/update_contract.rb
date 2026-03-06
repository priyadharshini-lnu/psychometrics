# frozen_string_literal: true

module Api
  module V2
    module AIScoringApprovalSetting
      class UpdateContract < Contract
        schema Api::V2::AIScoringApprovalSetting::Schema.update_request

        rule(data: { relationships: { assessment: { data: :id } } }) do
          current_record_id = values.dig(:data, :id)
          if _context[:campaign].ai_scoring_approval_settings.where.not(id: current_record_id).
             exists?(assessment_id: value)
            key.failure(:assessment_exists)
          end
        end
      end
    end
  end
end
