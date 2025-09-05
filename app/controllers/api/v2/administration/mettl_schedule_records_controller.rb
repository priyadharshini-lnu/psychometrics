# frozen_string_literal: true

module Api
  class V2::Administration::MettlScheduleRecordsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction
    validate_crud_requests Api::V2::MettlScheduleRecord::Schema
    validates_request_schema :create, -> { Api::V2::MettlScheduleRecord::CreateContract.new }
    validates_request_schema :update, -> { Api::V2::MettlScheduleRecord::UpdateContract.new }

    def create
      assessment = ::Assessment.find_by(id: params[:data][:attributes][:assessment_id])
      schedule_request = Mettl::BuildScheduleRequestBody.call!(attributes: mettl_schedule_record_params,
                                                               assessment: assessment)

      begin
        mettl_schedule_record = ::Mettl::CreateSchedule.call!(assessment, schedule_request)

        if mettl_schedule_record.present?
          mettl_schedule_record.update!(mettl_schedule_record_params)
          audit! :create, @mettl_schedule_record, payload: params, project: project
        end

        jsonapi_render json: mettl_schedule_record
      rescue RuntimeError => e
        jsonapi_render json: { error: e.message }, status: 422
      end
    end

    def update
      mettl_schedule_record = ::MettlScheduleRecord.find(params[:id])
      assessment = mettl_schedule_record.assessment
      schedule_request = Mettl::BuildScheduleRequestBody.call!(attributes: mettl_schedule_record_params,
                                                               assessment: assessment)

      begin
        response = ::Mettl::EditSchedule.call!(mettl_schedule_record, schedule_request)

        if response.present? && response['status'] == 'SUCCESS'
          mettl_schedule_record.update!(mettl_schedule_record_params)

          Mettl::UpdateDuplicateScheduleRecordsJob.perform_later(mettl_schedule_record, mettl_schedule_record_params)
          audit! :update, mettl_schedule_record, payload: params, project: project
        end

        jsonapi_render json: mettl_schedule_record
      rescue RuntimeError => e
        jsonapi_render json: { error: e.message }, status: 422
      end
    end

    private

    def mettl_schedule_record_params
      params.require(:data).require(:attributes).permit(
        :assessment_id,
        :schedule_name,
        :secure_browser_enabled,
        web_proctoring_settings: %i[enabled count show_remaining_counts],
        visual_proctoring_settings: %i[enabled candidate_screen_capture candidate_authorization]
      )
    end
  end
end
