# frozen_string_literal: true

module Api
  module V2
    module ReportApprovalSetting
      class UpdateContract < Contract
        schema Api::V2::ReportApprovalSetting::Schema.update_request
      end
    end
  end
end
