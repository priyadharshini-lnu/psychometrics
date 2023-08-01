# frozen_string_literal: true

module EndUser
  class BookingsSerializer < ActiveModel::Serializer
    attributes :id, :title, :description, :duration, :status, :is_action_by_current_user

    delegate :title, :description, to: :workshop_invite

    def duration
      workshop_invite.workshops.first.duration
    end

    def is_action_by_current_user
      if %w[cancelled rescheduled].include?(object.status)
        last_log = workshop_invite.workshop_invite_logs.where(
          action: object.status, user_id: current_user.id
        ).order(:created_at).last
        last_log&.created_by_id == current_user.id
      end
    end

    def workshop_invite
      @workshop_invite ||= object.workshop_invite
    end

    def current_user
      @current_user ||= instance_options[:current_user]
    end
  end
end
