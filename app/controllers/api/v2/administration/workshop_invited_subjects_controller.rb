# frozen_string_literal: true

module Api
  class V2::Administration::WorkshopInvitedSubjectsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::WorkshopInvitedSubject::Schema
    validates_request_schema :create, Api::V2::WorkshopInvitedSubject::CreateContract.new

    before_action :set_resource, only: :accept_request

    def reject_request
      response = Workshops::InviteRequest::RejectRequest.call(params, current_user)

      if response && response[:invalid].present?
        jsonapi_render json: { error: response[:invalid] }, status: 422
      else
        audit! :reject_request, response[:ok], campaign: campaign
        jsonapi_render json: response[:ok]
      end
    end

    def accept_request
      response =
        if @workshop_invited_subject.reschedulable?
          Workshops::InviteRequest::RescheduleRequest.call(params, current_user)
        else
          Workshops::InviteRequest::CancelRequest.call(params, current_user)
        end

      if response && response[:invalid].present?
        jsonapi_render json: { error: response[:invalid] }, status: 422
      else
        audit! :accept_request, @workshop_invited_subject, campaign: campaign
        jsonapi_render json: response[:ok]
      end
    end

    def meta_details
      {
        permissions: lambda {
          GetPermissionsHash.call!(
            ::Api::Administration::WorkshopInvitedSubjectPolicy,
            context[:user],
            @model,
            %w[create],
            { project_id: context[:campaign]&.project_id }
          )
        }
      }
    end

    private

    def set_resource
      @workshop_invited_subject = Api::Administration::WorkshopInvitedSubjectPolicy::Scope.new(
        current_user, WorkshopInvitedSubject
      ).resolve.find(params[:id])
    end
  end
end
