# frozen_string_literal: true

module Comparator
  class Number
    def initialize(lhs, rhs, comparator)
      @lhs = lhs
      @rhs = rhs
      @comparator = comparator
    end

    def call
      case comparator
      when 'equal'
        lhs == rhs
      when 'not_equal'
        lhs != rhs
      when 'less_than'
        lhs < rhs
      when 'more_than'
        lhs > rhs
      end
    end
  end
end
