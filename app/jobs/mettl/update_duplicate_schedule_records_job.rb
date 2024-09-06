# frozen_string_literal: true

module Mettl
  class UpdateDuplicateScheduleRecordsJob < ApplicationJob
    def perform(mettl_schedule_record, mettl_schedule_record_params)
      assessment = mettl_schedule_record.assessment

      MettlScheduleRecord.where(duplicated_from_id: mettl_schedule_record.id).each do |duplicate_schedule_record|
        mettl_schedule_record_params[:schedule_name] = duplicate_schedule_record.schedule_name

        schedule_request = Mettl::BuildScheduleRequestBody.call!(attributes: mettl_schedule_record_params,
                                                                 assessment: assessment)
        response = ::Mettl::EditSchedule.call!(duplicate_schedule_record, schedule_request)

        if response['status'] == 'SUCCESS'
          duplicate_schedule_record.update!(mettl_schedule_record_params)
        end
      end
    end
  end
end
