# frozen_string_literal: true

module Api
  class V2::Administration::WorkshopsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::Workshop::Schema
    validates_request_schema :update, Api::V2::Workshop::UpdateContract.new
    validates_request_schema :create_bulk_workshops, Api::V2::Workshop::CreateAllContract.new
    validates_request_schema :bulk_update_subjects,
                             Api::V2::Workshop::Schema.bulk_update_subjects

    prepend_before_action :set_workshop, only: %i[bulk_update_subjects update]

    def bulk_update_subjects
      WorkshopSubjects::BulkUpdateSubjects.call!(@workshop, bulk_subject_params)
      jsonapi_render json: @workshop
    end

    def create_bulk_workshops
      workshops_data = workshop_params[:workshops]

      response = ::Workshops::CreateAll.call!(
        workshops_data,
        params[:campaign_id]
      )

      if response && response[:error]
        render json: { error: response[:error] }, status: 400
      else
        jsonapi_render json: response[:workshops]
      end
    end

    def update
      ::Workshops::Update.call!(@workshop, workshop_update_params)

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
      params.require(:data).require(:attributes).permit(:name, :total_seats, workshop_managers_ids: [],
                                                        workshop_assessors_ids: [])
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
