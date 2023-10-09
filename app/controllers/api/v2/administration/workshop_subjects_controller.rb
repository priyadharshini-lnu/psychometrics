# frozen_string_literal: true

module Api
  class V2::Administration::WorkshopSubjectsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::WorkshopSubject::Schema
    validates_request_schema :create, Api::V2::WorkshopSubject::CreateContract.new

    def update_subject_details_and_assessments
      response = WorkshopSubjects::UpdateSubjectData.call(
        params[:id], params[:campaign_id], params[:data][:attributes]
      )

      if response && response[:error].present?
        render json: { error: response[:error] }, status: 422
      else
        audit! :update_subject_details_and_assessments, response[:ok], payload: params, campaign: campaign
        render json: :ok
      end
    end

    def mark_cancelled
      subject = WorkshopSubject.find(params[:id])
      if subject.workshop.cancellable?
        subject.update!(scheduling_status: :cancelled)
      else
        subject.update!(scheduling_status: :late_cancelled)
      end
      subject.workshop.decrement!(:booked_seats)
      audit! :mark_cancelled, subject, payload: params, campaign: campaign

      jsonapi_render json: subject
    end

    def meta_details
      {
        permissions: lambda {
          GetPermissionsHash.call!(
            Administration::WorkshopSubjectPolicy,
            context[:user],
            @model,
            [
              'index',
              'create',
              %w[manage update],
              %w[remove destroy]
            ],
            { campaign_id: campaign_id }
          )
        }
      }
    end

    def campaign_id
      super || model?.campaign_id
    end
  end
end
