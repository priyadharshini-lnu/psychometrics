# frozen_string_literal: true

module Threesixty
  module Options
    module Reports
      class AvailabilityOptionForm < Rectify::Form
        attribute :email_subject_when_report_available, Boolean
        attribute :email_manager_when_report_available, Boolean
      end
    end
  end
end
