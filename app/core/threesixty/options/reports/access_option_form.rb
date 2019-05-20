# frozen_string_literal: true

module Threesixty
  module Options
    module Reports
      class AccessOptionForm < Rectify::Form
        attribute :self_can_access, Boolean
        attribute :manager_can_access, Boolean
        attribute :manager_cannot_see_report_until_requirements_are_met, Boolean
      end
    end
  end
end
