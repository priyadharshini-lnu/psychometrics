# frozen_string_literal: true

module Administration
  module Assessments
    module ExternalSettings
      class IihtForm < BaseForm
        attribute :assessment_id,   Integer
        attribute :schedule_config, Hash

        validates :assessment_id,   presence: true
        validate :iiht_schedule_config

        private

        def iiht_schedule_config
          return unless assessment

          JSON.parse(schedule_config) if schedule_config.present?
        rescue JSON::ParserError
          errors.add(:schedule_config, :invalid)
        end
      end
    end
  end
end
