module Threesixty
  class Campaign < ApplicationRecord
    belongs_to :campaign, class_name: '::Campaign'
    belongs_to :assessment
    belongs_to :report
    has_one :project, through: :campaign
    has_one :option, foreign_key: :threesixty_campaign_id, dependent: :destroy
    has_one :datasheet, through: :project
    has_many :nomination_requirements, foreign_key: :threesixty_campaign_id
    has_many :participants, through: :campaign
    has_many :campaigns_users, through: :campaign
    has_many :subjects, through: :campaign
    has_many :evaluators, through: :campaign
    has_many :users_assessments, dependent: :destroy
    has_many :email_templates, foreign_key: :threesixty_campaign_id
    has_many :email_schedules, foreign_key: :threesixty_campaign_id
    has_many :instruction_templates, foreign_key: :threesixty_campaign_id

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

    def datasheet_column_names
      datasheet&.column_names || []
    end
  end
end
