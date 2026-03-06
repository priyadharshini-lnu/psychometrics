# frozen_string_literal: true

module Api
  module V2
    module AIScoringApprovalSetting
      class CreateContract < Contract
        schema Api::V2::AIScoringApprovalSetting::Schema.create_request

        rule(data: { relationships: { assessment: { data: :id } } }) do
          if _context[:campaign].ai_scoring_approval_settings.exists?(assessment_id: value)
            key.failure(:assessment_exists)
          end
        end
      end
    end
  end
end
