# frozen_string_literal: true

module Api
  class V2::Administration::WorkshopInvites::WorkshopsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::Workshop::Schema
    prepend_before_action :set_workshop_invite, only: %i[destroy]

    private

    def set_workshop_invite
      @workshop_invite = Api::Administration::WorkshopInvitePolicy::Scope.new(
        current_user, WorkshopInvite
      ).resolve.find(params[:workshop_invite_id])
    end
  end
end
