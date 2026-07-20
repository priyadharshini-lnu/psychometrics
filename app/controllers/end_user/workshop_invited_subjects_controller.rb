# frozen_string_literal: true

class EndUser::WorkshopInvitedSubjectsController < ApplicationController
  def bookings
    @resources = WorkshopInvitedSubject.where(
      user_id: current_user.id
    ).bookings

    serialized_resources = Panko::ArraySerializer.new(
      @resources,
      each_serializer: ::EndUser::BookingsSerializer,
      context: { current_user: current_user }
    ).to_a

    render json: {
      list: serialized_resources
    }
  end

  def invites
    @resources = WorkshopInvitedSubject.
                 joins(workshop_invite: { campaign: :campaign_users }).
                 where(
                   user_id: current_user.id,
                   campaign_users: {
                     user_id: current_user.id,
                     active: true
                   }
                 ).
                 invites

    serialized_resources = Panko::ArraySerializer.new(
      @resources,
      each_serializer: ::EndUser::WorkshopInvitedSubjectSerializer
    ).to_a

    render json: {
      list: serialized_resources
    }
  end
end
