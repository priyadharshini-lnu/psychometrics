# frozen_string_literal: true

module EndUser
  class IndividualInviteSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:title).maybe(:str?)
        required(:description).maybe(:str?)
        required(:allow_language_preference).filled(:bool?)
        required(:allowed_languages).filled(:array?)
        required(:available_dates).array do
          hash do
            required(:id).filled(:int?)
            required(:date).filled(:str?)
          end
        end
        required(:timezone).filled(:str?)
        required(:duration).filled(:int?)
        required(:allow_neurodiversity_option).filled(:bool?)
        required(:cancellation_lead_time).filled(:int?)
        required(:reschedule_lead_time).filled(:int?)
        required(:booking_prework_condition_unsatisfied).filled(:bool?)
        required(:campaign_id).maybe(:int?)
      end
    end
  end
end
