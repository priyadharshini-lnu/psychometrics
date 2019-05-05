module Threesixty
  class Campaign < ApplicationRecord
    belongs_to :campaign, class_name: '::Campaign'
    belongs_to :assessment
    belongs_to :report
    has_one :option, foreign_key: :threesixty_campaign_id

    attr_accessor :factors, :type

    enum type: %i[empty standard_360 previous_360]

    delegate :subjects, :evaluators, :project, :participants, to: :campaign

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

  end
end
