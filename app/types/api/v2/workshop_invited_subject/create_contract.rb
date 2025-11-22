# frozen_string_literal: true

module Api
  module V2
    module WorkshopInvitedSubject
      class CreateContract < Api::Base::Contract
        config.messages.namespace = :workshop_invited_subject_create

        schema Api::V2::WorkshopInvitedSubject::Schema.create_request

        rule(data: { relationships: { user: { data: :id } } }) do
          workshop_invite = ::WorkshopInvite.find_by(
            id: values.dig(:data, :relationships, :workshop_invite, :data, :id)
          )

          workshop_invited_subject = ::WorkshopInvitedSubject.in_campaign_assessment_group(
            workshop_invite.campaign_id,
            workshop_invite.campaign_assessment_group_id
          ).where(user_id: value).first

          if workshop_invited_subject
            invite_title = workshop_invited_subject.workshop_invite.title.presence
            key.failure(:part_of_other_workshop_invite, workshop_invite_name: invite_title)
          end
        end

        rule(data: { relationships: { user: { data: :id } } }) do
          subject_exists = ::WorkshopInvitedSubject.exists?(
            user_id: value, workshop_invite_id: values.dig(:data, :relationships, :workshop_invite, :data, :id)
          )
          key.failure(:already_exists) if subject_exists
        end
      end
    end
  end
end
