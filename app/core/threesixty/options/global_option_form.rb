# frozen_string_literal: true

module Threesixty
  module Options
    class GlobalOptionForm < Rectify::Form
      ALL_BOOLEAN_FIELDS = %i[
        can_not_edit_evaluation
      ].freeze

      attribute :can_not_edit_evaluation, Boolean, deafult: false

      validates(*ALL_BOOLEAN_FIELDS,
                inclusion: { in: [true, false], message: "doesn't have a valid value" },
                allow_nil: true)
    end
  end
end
