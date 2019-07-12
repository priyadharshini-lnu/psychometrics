# frozen_string_literal: true

module Comparator
  class String
    def initialize(lhs, rhs, comparator)
      @lhs = lhs
      @rhs = rhs
      @comparator = comparator
    end

    def call
      case comparator
      when 'starts_with'
        lhs.starts_with?(rhs)
      when 'equal'
        lhs == rhs
      when 'not_equal'
        lhs != rhs
      end
    end
  end
end
