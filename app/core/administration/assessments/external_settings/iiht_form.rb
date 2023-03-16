# frozen_string_literal: true

module Administration
  module Assessments
    module ExternalSettings
      class IihtForm < BaseForm
        attribute :assessment_id,   Integer
        attribute :schedule_config, Hash

        validates :assessment_id,   presence: true
        validate :iiht_schedule_config

        def attributes
          return super if schedule_config.blank?

          parsed_config = begin
            JSON.parse(schedule_config)
          rescue JSON::ParserError
            schedule_config
          end
          super.merge(schedule_config: parsed_config)
        end

        private

        def iiht_schedule_config
          return unless assessment

          parsed_response = JSON.parse(schedule_config) if schedule_config.present?
          errors.add(:schedule_config, :invalid) unless parsed_response.is_a?(Hash)
        rescue JSON::ParserError
          errors.add(:schedule_config, :invalid)
        end
      end
    end
  end
end
