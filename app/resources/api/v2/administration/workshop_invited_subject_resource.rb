# frozen_string_literal: true

class Api::V2::Administration::WorkshopInvitedSubjectResource < Api::V2::Administration::BaseResource
  attributes :status, :reason, :booked_workshop_date_time, :subject_workshop_date_time, :workshop_invite_id

  has_one :user
  has_one :workshop_invite
  has_many :workshops

  audit_log_for :create, payload: '*'
  audit_log_for :destroy, payload: lambda { |_, workshop_invited_subject|
    {
      id: workshop_invited_subject.id,
      user_id: workshop_invited_subject.user.id,
      user_name: workshop_invited_subject.user.name,
      user_email: workshop_invited_subject.user.email,
      status: workshop_invited_subject.status
    }
  }

  ransack_filters %i[filterable_fields workshop_invite_campaign_id_eq]

  filter :status_in, apply: lambda { |records, statuses, _options|
    records.where(status: statuses)
  }

  def subject_workshop_date_time
    @model.workshop_subject&.workshop&.start_time
  end

  def booked_workshop_date_time
    return unless @model.reschedule_workshop_id

    Workshop.find(@model.reschedule_workshop_id).start_time
  end

  def self.records(options = {})
    if options.dig(:context, :params, :workshop_invite_id)
      WorkshopInvitedSubject.
        includes(user: :user_profile).
        where(workshop_invite_id: options[:context][:params][:workshop_invite_id])
    else
      WorkshopInvitedSubject.
        includes(:workshop_subject, :workshop_invite).
        where(workshop_invites: {
          campaign_id: options.dig(:context, :params, :filter, :workshop_invite_campaign_id_eq)
        })
    end
  end

  def self.sortable_fields(context)
    super + [:'user.first_name']
  end
end
