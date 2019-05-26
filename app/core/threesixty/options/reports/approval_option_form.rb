# frozen_string_literal: true

module Threesixty
  module Options
    module Reports
      class ApprovalOptionForm < Rectify::Form
        attribute :manager_approves_reports, Boolean
        attribute :allow_manager_view_individual_responses, Boolean
        attribute :email_manager_when_report_ready_for_approval, Boolean
        attribute :administrator_approves_reports, Boolean
      end
    end
  end
end
