# frozen_string_literal: true

module EndUser
  class IndividualInviteSerializer < Panko::Serializer
    attributes :id, :title, :description, :allow_language_preference, :allowed_languages, :available_dates,
               :timezone, :duration, :allow_neurodiversity_option, :cancellation_lead_time, :scheduling_lead_time,
               :booking_prework_condition_unsatisfied, :campaign_id, :previous_groups_completion_unsatisfied
    delegate :title, :description, to: :object

    def available_dates
      object.available_workshops_date_and_id
    end

    delegate :duration, :timezone, :cancellation_lead_time, :scheduling_lead_time, to: :workshop

    def booking_prework_condition_unsatisfied
      !Bookings::PreworkConditionsSatisfied.call!(workshop.campaign_id, context[:current_user].id)
    end

    def previous_groups_completion_unsatisfied
      !Workshops::CanBookBasedOnSequencing.call!(workshop.campaign_assessment_group, context[:current_user].id)
    end

    def workshop
      object.workshops.first
    end
  end
end
