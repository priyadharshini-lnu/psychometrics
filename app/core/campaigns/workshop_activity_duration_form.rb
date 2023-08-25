# frozen_string_literal: true

module Campaigns
  class WorkshopActivityDurationForm < Rectify::Form
    attribute :workshop_activity_duration, Integer
    attribute :workshop_activity, Boolean

    validates :workshop_activity_duration, presence: true, numericality: { greater_than_or_equal_to: 1,
                                                                           less_than_or_equal_to: 480 },
              if: :workshop_activity?

    private

    def workshop_activity?
      workshop_activity == true
    end
  end
end
