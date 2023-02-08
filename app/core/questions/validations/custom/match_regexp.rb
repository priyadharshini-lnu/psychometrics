# frozen_string_literal: true

module Questions::Validations::Custom
  class MatchRegexp < BaseCommand
    attr_accessor :regexp, :value

    def initialize(condition, value)
      @regexp = Regexp.new(condition['value'])
      @value = value
    end

    def call
      broadcast :ok, regexp.match(value)
    end
  end
end
