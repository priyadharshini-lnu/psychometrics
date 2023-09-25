# frozen_string_literal: true

class EndUser::WorkshopInvitedSubjectsController < ApplicationController
  def bookings
    @resources = WorkshopInvitedSubject.where(
      user_id: current_user.id
    ).bookings

    serialized_resources = ActiveModelSerializers::SerializableResource.new(
      @resources,
      each_serializer: ::EndUser::BookingsSerializer,
      current_user: current_user
    )

    render json: {
      list: serialized_resources
    }
  end

  def invites
    @resources = WorkshopInvitedSubject.where(
      user_id: current_user.id
    ).invites

    serialized_resources = ActiveModelSerializers::SerializableResource.new(
      @resources,
      each_serializer: ::EndUser::WorkshopInvitedSubjectSerializer
    )

    render json: {
      list: serialized_resources
    }
  end
end
