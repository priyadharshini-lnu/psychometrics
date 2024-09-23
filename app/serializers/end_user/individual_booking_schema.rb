# frozen_string_literal: true

# rubocop:disable Metrics/AbcSize
# rubocop:disable Metrics/BlockLength
module EndUser
  class IndividualBookingSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:title).filled(:str?)
        required(:description).filled(:str?)
        required(:duration).maybe(:int?)
        required(:status).maybe(:str?)
        required(:workshop_id).maybe(:int?)
        required(:preferred_language).maybe(:str?)
        required(:neurodivergent_comments).maybe(:str?)
        required(:allow_language_preference).maybe(:bool?)
        required(:timezone).maybe(:str?)
        required(:scheduling_lead_time).maybe(:int?)
        required(:allow_late_cancellation_and_rescheduling).maybe(:bool?)
        required(:available_dates).array do
          hash do
            required(:id).filled(:int?)
            required(:date).filled(:str?)
          end
        end
        required(:booked_date).hash do
          required(:id).filled(:int?)
          required(:date).filled(:str?)
        end
        required(:allow_neurodiversity_option).maybe(:bool?)
        required(:allowed_languages).maybe(:array?)

        required(:cancellation_lead_time).maybe(:int?)
        required(:neurodivergent).maybe(:bool?)
        required(:booking_prework_condition_unsatisfied).maybe(:bool?)
        required(:campaign_id).filled(:int?)
      end
    end
  end
end
# rubocop:enable Metrics/AbcSize
# rubocop:enable Metrics/BlockLength
