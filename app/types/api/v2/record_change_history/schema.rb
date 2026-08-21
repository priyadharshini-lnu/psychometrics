# frozen_string_literal: true

module Api
  module V2
    module RecordChangeHistory
      class Schema < Api::Base::Schema
        def self.resource
          'record_change_histories'
        end

        def self.attributes(_attribute, _)
          proc do
            optional(:record_type).maybe(:string)
            optional(:record_id).maybe(:string)
            optional(:request_uuid).maybe(:string)
            optional(:start_date).maybe(:string)
            optional(:end_date).maybe(:string)
            optional(:associated_record).maybe(:string)
            optional(:auditable_type).maybe(:string)
            optional(:changed_field).maybe(:string)
            optional(:page).maybe(:integer)
            optional(:size).maybe(:integer)
          end
        end
      end
    end
  end
end
