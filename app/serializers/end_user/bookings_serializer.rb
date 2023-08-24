# frozen_string_literal: true

module EndUser
  class BookingsSerializer < ActiveModel::Serializer
    attributes :id, :title, :description, :duration, :status, :is_action_by_current_user, :workshop_invite_id, :date,
               :timezone, :cancellation_lead_time

    delegate :duration, :timezone, :cancellation_lead_time, to: :workshop, allow_nil: true

    delegate :title, :description, to: :workshop_invite

    def date
      workshop&.start_time&.iso8601
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

    def workshop
      @workshop ||= WorkshopSubject.find_by(
        user_id: current_user.id,
        campaign_id: object.workshop_invite.campaign_id
      )&.workshop
    end

    def current_user
      @current_user ||= instance_options[:current_user]
    end
  end
end
