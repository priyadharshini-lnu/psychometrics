# frozen_string_literal: true

module EndUser
  class IndividualBookingSerializer < ActiveModel::Serializer
    attributes :id, :title, :description, :duration, :status, :workshop_id, :preferred_language,
               :neurodivergent_comments, :allow_language_preference, :timezone, :reschedule_lead_time,
               :available_dates, :booked_date, :allow_neurodiversity_option, :allowed_languages,
               :cancellation_lead_time, :neurodivergent

    delegate :duration, :reschedule_lead_time, :cancellation_lead_time, :timezone, to: :workshop, allow_nil: true
    delegate :id, to: :workshop, prefix: true, allow_nil: true
    delegate :status, to: :workshop_invited_subject
    delegate :preferred_language, :neurodivergent, :neurodivergent_comments, to: :workshop_subject, allow_nil: true

    def booked_date
      if workshop
        {
          id: workshop.id,
          date: workshop.start_time.iso8601
        }
      end
    end

    def available_dates
      object.available_workshops_date_and_id
    end

    private

    def workshop_invited_subject
      @workshop_invited_subject ||= WorkshopInvitedSubject.find_by(
        user_id: current_user.id,
        workshop_invite_id: object.id
      )
    end

    def workshop_subject
      @workshop_subject ||= WorkshopSubject.find_by(
        user_id: current_user.id,
        campaign_id: object.campaign_id
      )
    end

    def workshop
      @workshop ||= workshop_subject&.workshop
    end

    def current_user
      @current_user ||= instance_options[:current_user]
    end
  end
end
