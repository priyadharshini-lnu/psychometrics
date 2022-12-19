# frozen_string_literal: true

module Api
  module V2
    module ReportApprovalSetting
      class UpdateContract < Contract
        schema Api::V2::ReportApprovalSetting::Schema.update_request

        rule(data: { relationships: { report: { data: :id } } }) do
          current_record_id = values.dig(:data, :id)
          if _context[:campaign].report_approval_settings.where.not(id: current_record_id).exists?(report_id: value)
            key.failure(:report_exists)
          end
        end
      end
    end
  end
end
