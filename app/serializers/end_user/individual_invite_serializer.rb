# frozen_string_literal: true

module EndUser
  class IndividualInviteSerializer < Panko::Serializer
    attributes :id, :title, :description, :allow_language_preference, :allowed_languages, :available_dates,
               :timezone, :duration, :allow_neurodiversity_option, :cancellation_lead_time, :scheduling_lead_time,
               :booking_prework_condition_unsatisfied, :campaign_id
    delegate :title, :description, to: :object

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

    def scheduling_lead_time
      object.workshops.first.scheduling_lead_time
    end

    def booking_prework_condition_unsatisfied
      !Bookings::PreworkConditionsSatisfied.call!(object.workshops.first.campaign_id, context[:current_user].id)
    end
  end
end
