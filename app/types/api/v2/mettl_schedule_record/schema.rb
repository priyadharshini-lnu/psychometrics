# frozen_string_literal: true

module Api
  module V2
    module MettlScheduleRecord
      class Schema < Api::Base::Schema
        def self.resource
          'mettl_schedule_records'
        end

        def self.attributes(_attribute, _)
          proc do
            required(:schedule_name).filled(:string)
            required(:schedule_id).filled(:string)
            attribute[:created_at].filled(:string)
          end
        end
      end
    end
  end
end
