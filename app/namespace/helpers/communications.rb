module Helpers
  module Communications
    module_function

    DAYS = [1, 3, 5, 7, 15, 30].freeze

    def reminder_timeframes
      DAYS.map { |i| "#{i} #{'day'.pluralize(i)}" }
    end
  end
end
