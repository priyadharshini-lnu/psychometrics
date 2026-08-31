# frozen_string_literal: true

module Communications
  module Deliveries
    module Rules
      MAP = {
        'invitation' => %w[send_now specific_datetime],
        'other' => %w[send_now specific_datetime],
        'reminder' => %w[not_started not_completed in_progress]
      }.freeze
    end
  end
end
