# frozen_string_literal: true

class Api::V2::Administration::WorkshopInvitedSubjectResource < Api::V2::Administration::BaseResource
  attributes :status

  has_one :user
  has_one :workshop_invite

  ransack_filters %i[filterable_fields]

  def self.records(options = {})
    WorkshopInvitedSubject.includes(user: :user_profile).where(
      workshop_invite_id: options[:context][:params][:workshop_invite_id]
    )
  end

  def self.sortable_fields(context)
    super + [:'user.first_name']
  end
end
