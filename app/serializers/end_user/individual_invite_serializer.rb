# frozen_string_literal: true

module EndUser
  class IndividualInviteSerializer < ActiveModel::Serializer
    attributes :id, :title, :description, :allow_language_preference, :allowed_languages, :available_dates,
               :timezone, :duration, :allow_neurodiversity_option, :cancellation_lead_time, :reschedule_lead_time

    def available_dates
      object.available_workshops_date_and_id
    end

    def duration
      object.workshops.first.duration
    end

    def timezone
      object.workshops.first.timezone
    end

    def cancellation_lead_time
      object.workshops.first.cancellation_lead_time
    end

    def reschedule_lead_time
      object.workshops.first.reschedule_lead_time
    end
  end
end
