# frozen_string_literal: true

module Api
  module V2
    module ReportApprovalSetting
      class CreateContract < Contract
        schema Api::V2::ReportApprovalSetting::Schema.create_request

        rule(data: { relationships: { report: { data: :id } } }) do
          if _context[:campaign].report_approval_settings.exists?(report_id: value)
            key.failure(:report_exists)
          end
        end
      end
    end
  end
end
