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
        jsonapi_render json: response[:ok]
      end
    end

    private

    def set_resource
      @workshop_invited_subject = Api::Administration::WorkshopInvitedSubjectPolicy::Scope.new(
        current_user, WorkshopInvitedSubject
      ).resolve.find(params[:id])
    end

    def campaign_id
      return WorkshopInvite.find(params[:workshop_invite_id]).campaign_id if params[:workshop_invite_id]

      set_resource if params[:id]
      super || @workshop_invited_subject&.campaign&.id || params.dig(:filter, :workshop_invite_campaign_id_eq)
    end
  end
end
