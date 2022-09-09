# frozen_string_literal: true

module Helpers
  module Communications
    module_function

    DAYS = [1, 3, 5, 7, 15, 30].freeze

    def reminder_timeframes
      array = DAYS.map { |i| "#{i} #{'day'.pluralize(i)}" }
      array = DAYS.map { |i| "#{i} #{'minute'.pluralize(i)}" } + array unless Rails.env.production?
      array
    end
  end
end
