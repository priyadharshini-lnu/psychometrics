# frozen_string_literal: true

module Microsite
  module AnswerConverters
    class Base
      # Convert microsite option values to index
      # Handles: a=0, b=1, c=2, o1=0, o2=1, opt-1=0, opt-2=1
      def self.option_value_to_index(value)
        return value.to_i if value.is_a?(Numeric)

        case value.to_s
          when /^[a-z]$/i
            value.downcase.ord - 'a'.ord
          when /^o(\d+)$/, /^opt-(\d+)$/
            ::Regexp.last_match(1).to_i - 1
          else
            0
        end
      end

      # Convert microsite statement IDs to index
      # Handles: s1=0, s2=1, statement-1=0, stmt_1=0, etc.
      def self.statement_id_to_index(statement_id)
        return statement_id.to_i if statement_id.is_a?(Numeric)

        case statement_id.to_s
          when /^s(\d+)$/i, /^statement[-_]?(\d+)$/i, /^stmt[-_]?(\d+)$/i
            ::Regexp.last_match(1).to_i - 1
          else
            # Last resort: extract any trailing number
            match = statement_id.to_s.match(/(\d+)$/)
            match ? match[1].to_i - 1 : 0
        end
      end
    end
  end
end
