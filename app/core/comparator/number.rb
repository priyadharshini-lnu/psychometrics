# frozen_string_literal: true

module Comparator
  class Number < BaseCommand
    attr_reader :lhs, :rhs, :comparator

    def initialize(lhs, rhs, comparator)
      @lhs = lhs.to_i
      @rhs = rhs.to_i
      @comparator = comparator
    end

    def call
      result = case comparator
      when 'equal'
        lhs == rhs
      when 'not_equal'
        lhs != rhs
      when 'less_than'
        lhs < rhs
      when 'more_than'
        lhs > rhs
      end

      broadcast :ok, result
    end
  end
end
