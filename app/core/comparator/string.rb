# frozen_string_literal: true

module Comparator
  class String < BaseCommand
    attr_reader :lhs, :rhs, :comparator

    def initialize(lhs, rhs, comparator)
      @lhs = lhs&.downcase
      @rhs = rhs&.downcase
      @comparator = comparator
    end

    def call
      result = case comparator
      when 'starts_with'
        lhs&.starts_with?(rhs)
      when 'equal'
        lhs == rhs
      when 'not_equal'
        lhs != rhs
      end

      broadcast :ok, result
    end
  end
end
