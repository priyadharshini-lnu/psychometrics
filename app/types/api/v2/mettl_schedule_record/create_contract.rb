# frozen_string_literal: true

module Api
  module V2
    module MettlScheduleRecord
      class CreateContract < Api::Base::Contract
        config.messages.namespace = :mettl_schedule_record_create

        schema Api::V2::MettlScheduleRecord::Schema.create_request

        rule(data: { attributes: :schedule_name }) do
          key.failure(:filled?) if key? && value.blank?
        end

        rule(data: { attributes: :assessment_id }) do
          key.failure(:filled?) if key? && value.blank?
        end

        rule(data: { attributes: :schedule_name }) do
          assessment_id = values.dig(:data, :attributes, :assessment_id)

          record = ::MettlScheduleRecord.find_by(assessment_id: assessment_id, schedule_name: value)
          key.failure(:uniq_schedule_name) if record.present?
        end
      end
    end
  end
end
