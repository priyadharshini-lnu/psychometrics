# frozen_string_literal: true

module Api
  class V2::Administration::Clients::ReportsController < Api::V2::Administration::BaseController
    def policy_class
      @policy_class ||= Api::Administration::Clients::ReportPolicy
    end
  end
end
