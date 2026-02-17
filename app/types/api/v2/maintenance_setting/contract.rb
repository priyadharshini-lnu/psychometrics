# frozen_string_literal: true

module Api
  module V2
    module MaintenanceSetting
      class Contract < Api::Base::Contract
        config.messages.namespace = :maintenance_settings

        rule(data: { attributes: :end_time }) do
          start_time = values.dig(:data, :attributes, :start_time)
          end_time = value
          if start_time && end_time && end_time <= start_time
            key.failure(:must_be_after_start_time)
          end
        end
      end
    end
  end
end
