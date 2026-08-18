# frozen_string_literal: true

module Reports
  class CompletedAtDates < BaseCommand
    private_attr_reader :results

    def initialize(results)
      @results = results
    end

    def call
      dates = results.to_a.filter_map { |result| result&.completed_at&.to_date }.sort

      broadcast :ok, dates.empty? ? nil : [dates.first, dates.last]
    end
  end
end
