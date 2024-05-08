# frozen_string_literal: true

module Threesixty
  module EndUser
    class NominationRequirementSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:name).filled(:str?)
          required(:position).filled(:int?)
          required(:subject_conditions).filled(:hash?)
          required(:conditions).filled(:hash?)
        end
      end
    end
  end
end
