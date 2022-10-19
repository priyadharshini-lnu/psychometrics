# frozen_string_literal: true

module Questions::Validations
  class MatchRegexp < BaseCommand
    attr_accessor :regexp, :value

    def initialize(regexp, value)
      @regexp = Regexp.new(regexp)
      @value = value
    end

    def call
      broadcast :ok, !regexp.match(value)
    end
  end
end
