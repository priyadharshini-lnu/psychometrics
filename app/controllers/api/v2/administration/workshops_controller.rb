# frozen_string_literal: true

module Api
  class V2::Administration::WorkshopsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::Workshop::Schema
    validates_request_schema :update, Api::V2::Workshop::UpdateContract.new
    validates_request_schema :create_bulk_workshops, Api::V2::Workshop::CreateAllContract.new
    validates_request_schema :bulk_update_subjects,
                             Api::V2::Workshop::Schema.bulk_update_subjects
    validates_request_schema :change_status, Api::V2::Workshop::Schema.change_status_request

    prepend_before_action :set_workshop, only: %i[bulk_update_subjects update change_status]

    def bulk_update_subjects
      WorkshopSubjects::BulkUpdateSubjects.call!(@workshop, bulk_subject_params)
      audit! :bulk_update_subjects, @workshop, payload: bulk_subject_params, campaign: campaign
      jsonapi_render json: @workshop
    end

    def create_bulk_workshops
      workshops_data = workshop_params[:workshops]

      response = ::Workshops::CreateAll.call!(
        workshops_data,
        params[:campaign_id]
      )

      if response && response[:error]
        render json: { error: response[:error] }, status: 422
      else
        audit! :create_bulk_workshops, nil, record_type: 'Workshop', payload: workshop_params, campaign: campaign
        jsonapi_render json: response[:workshops]
      end
    end

    def change_status
      @workshop.update!(status: params.dig(:data, :attributes, :status))
      audit! :change_status, @workshop, payload: params, campaign: campaign

      jsonapi_render json: @workshop
    end

    def update
      ::Workshops::Update.call!(@workshop, workshop_update_params)
      audit! :update, @workshop, payload: workshop_update_params, campaign: campaign

      jsonapi_render json: @workshop
    end

    def workshop_params
      params.require(:data).require(:attributes).permit(
        :campaign_id,
        workshops: [
          :name,
          :total_seats,
          :meeting_link,
          :duration,
          :cancellation_lead_time,
          :reschedule_lead_time,
          :video_call_type,
          :start_time,
          :timezone,
          :allow_late_cancellation_and_rescheduling,
          {
            workshop_resources: %i[name url],
            center_manager_ids: [],
            assessor_ids: []
          }
        ]
      )
    end

    private

    def meta_details
      {
        permissions: lambda {
          GetPermissionsHash.call!(
            ::Api::Administration::WorkshopPolicy,
            current_user,
            model || model_class,
            %w[index show create],
            { campaign_id: campaign_id }
          )
        }
      }
    end

    def set_workshop
      return unless params[:id] || params[:workshop_id]

      @workshop = Api::Administration::WorkshopPolicy::Scope.new(
        current_user, Workshop, campaign_id: params[:campaign_id]
      ).resolve.find(params[:id] || params[:workshop_id])
    end

    def workshop_update_params
      params.require(:data).require(:attributes).permit(:name, :meeting_link, :total_seats, :video_call_type,
                                                        :allow_late_cancellation_and_rescheduling,
                                                        workshop_managers_ids: [], workshop_assessors_ids: [])
    end

    def bulk_subject_params
      params.require(:data).require(:attributes).permit(:override_existing, subject_ids: [],
                                                        assessments: %i[assessment_id action time])
    end

    def campaign_id
      set_workshop
      @workshop&.campaign_id || super
    end
  end
end
