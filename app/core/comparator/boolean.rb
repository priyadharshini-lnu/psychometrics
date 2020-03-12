# frozen_string_literal: true

module Comparator
  class Boolean < BaseCommand
    private_attr_reader :lhs, :rhs

    def initialize(lhs, rhs)
      @lhs = lhs
      @rhs = rhs
    end

    def call
      broadcast :ok, lhs == rhs
    end
  end
end
