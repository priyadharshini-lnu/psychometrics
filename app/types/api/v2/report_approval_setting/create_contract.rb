# frozen_string_literal: true

module Api
  module V2
    module ReportApprovalSetting
      class CreateContract < Contract
        schema Api::V2::ReportApprovalSetting::Schema.create_request
      end
    end
  end
end
