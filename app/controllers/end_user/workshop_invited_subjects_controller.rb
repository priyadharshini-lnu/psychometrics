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
                 includes(workshop_invite: %i[campaign_assessment_group workshops]).
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
      list: serialized_resources,
      assessment_group: build_assessment_group(@resources)
    }
  end

  private

  def build_assessment_group(resources)
    groups = {}

    resources.each do |invited_subject|
      group = invited_subject.workshop_invite.campaign_assessment_group
      next unless group

      entry = groups[group.id] ||= {
        id: group.id,
        name: group.name,
        invite_ids: []
      }

      entry[:invite_ids] << invited_subject.id
    end

    groups.values
  end
end
