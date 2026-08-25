# frozen_string_literal: true

module Threesixty
  module Subjects
    # Interprets the value of the "UAT" column in the subject import CSV.
    #
    # Accepted values (case-insensitive): "Yes" => true, "No"/blank => false.
    # Any other value is returned unchanged so that import validation can reject
    # the row with an explicit error naming the accepted values.
    module ParseUatValue
      ACCEPTED_VALUES = %w[Yes No].freeze

      module_function

      def call(value)
        return false if value.blank?

        case value.to_s.strip.downcase
          when 'yes' then true
          when 'no' then false
        end
      end

      def valid?(value)
        return true if value.blank?

        return true if [true, false].include?(value)

        [true, false].include?(call(value))
      end
    end
  end
end
