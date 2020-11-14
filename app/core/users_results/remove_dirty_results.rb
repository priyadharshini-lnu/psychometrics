# frozen_string_literal: true

module UsersResults
  class RemoveDirtyResults < BaseCommand
    def initialize(answers)
      @answers = answers || {}
    end

    def call
      result = answers.delete_if { |_, a| a['dirty'] }
      broadcast(:ok, result)
    end

    protected

    attr_reader :answers
  end
end
