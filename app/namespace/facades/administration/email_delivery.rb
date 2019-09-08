# frozen_string_literal: true

module Facades
  module Administration
    module EmailDelivery
      RULES = {
        invitation: %w[send_now specific_datetime],
        reminder: %w[not_competed not_started in_progress],
        other: %w[send_now specific_datetime]
      }.freeze
    end
  end
end
