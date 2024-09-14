# frozen_string_literal: true

module Threesixty
  class NominationSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = false

        required(:id).filled(:int?)
        required(:is_self).filled(:bool?)
        required(:can_send_request_approval_email).maybe(:bool?)
        required(:evalaution_completed_for_subject).filled(:bool?)
        required(:relationships).filled(:array?) { each(:hash?) }

        required(:evaluators).filled(:array?) { each(:hash?) }
        required(:subject).filled(:hash?)
        required(:options).filled(:hash?)
        required(:requirements).filled(:hash?)
        required(:instructions).filled(:array?) { each(:hash?) }
      end
    end
  end
end
