# frozen_string_literal: true

module Threesixty
  module Options
    class EvaluatorOptionForm < Rectify::Form
      ALL_BOOLEAN_FIELDS = %i(
        can_decline_nomination
        email_subject_when_evaluators_declines_nomination
      )

      attribute :can_decline_nomination, Boolean, deafult: false
      attribute :email_subject_when_evaluators_declines_nomination, Boolean, deafult: false

      validates *ALL_BOOLEAN_FIELDS,
        inclusion: { in: [ true, false ], message: "doesn't have a valid value" },
        allow_nil: true
    end
  end
end
