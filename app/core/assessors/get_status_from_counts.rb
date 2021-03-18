# frozen_string_literal: true

module Assessors
  class GetStatusFromCounts < BaseCommand
    private_attr_reader :evaluations

    def initialize(evaluations)
      @evaluations = evaluations
    end

    def call
      return broadcast :ok, :completed if evaluations[:total] == evaluations[:completed]

      is_in_progress = %i[in_progress interrupted completed timed_out].any? { |status| evaluations[status]&.positive? }
      return broadcast :ok, :in_progress if is_in_progress

      broadcast :ok, :not_started
    end
  end
end
