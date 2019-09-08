# frozen_string_literal: true

module Threesixty
  module Options
    class ManagerOptionForm < Rectify::Form
      ALL_BOOLEAN_FIELDS = %i[
        can_view_nominations
        can_choose_evaluators
        can_approve_nominations
        email_managers_on_nomination_approval
        subjects_can_email_managers
        email_subject_when_manager_declines_nomination
        can_approves_evaluations
      ].freeze

      attribute :can_view_nominations, Boolean, deafult: false
      attribute :can_choose_evaluators, Boolean, deafult: false
      attribute :can_approve_nominations, Boolean, deafult: false
      attribute :email_managers_on_nomination_approval, Boolean, deafult: false
      attribute :subjects_can_email_managers, Boolean, deafult: false
      attribute :email_subject_when_manager_declines_nomination, Boolean, deafult: false
      attribute :can_approves_evaluations, Boolean, deafult: false

      validates *ALL_BOOLEAN_FIELDS,
                inclusion: { in: [true, false], message: "doesn't have a valid value" },
                allow_nil: true
    end
  end
end
