module Threesixty
  class Campaign < ApplicationRecord
    belongs_to :campaign
    belongs_to :assessment
    belongs_to :report
    has_one :option, foreign_key: :threesixty_campaign_id

    before_create :create_dependencies

    attr_accessor :factors, :type

    enum type: %i[empty standard_360 previous_360]

    EMPTY = 'empty'
    STANDARD_360 = 'standard_360'
    PREVIOUS_360 = 'previous_360'

    TYPES = {
      EMPTY => 'Empty',
      STANDARD_360 => 'Standard 360',
      PREVIOUS_360 => 'Previous 360'
    }.freeze

    def attribute_names
      super + [:factors, :type]
    end

    def create_dependencies
      if assessment.present?
        create_campaign_from_assessment
      else
        create_empty_campaign
      end
    end

    def create_campaign_from_assessment
      Threesixty::CreateFromAssessment.call(self)
    end

    def create_empty_campaign
      Threesixty::CreateEmptyCampaign.call(self)
    end
  end
end
