# frozen_string_literal: true

module Api
  module V2
    module MettlScheduleRecord
      class UpdateContract < Api::Base::Contract
        config.messages.namespace = :mettl_schedule_record_create

        schema Api::V2::MettlScheduleRecord::Schema.update_request

        rule(data: { attributes: :schedule_name }) do
          key.failure(:filled?) if key? && value.blank?
        end

        rule(data: { attributes: :assessment_id }) do
          key.failure(:filled?) if key? && value.blank?
        end
      end
    end
  end
end
