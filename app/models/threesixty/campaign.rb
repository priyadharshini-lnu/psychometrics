# frozen_string_literal: true

module Threesixty
  class Campaign < ApplicationRecord
    audited

    belongs_to :campaign, class_name: '::Campaign'
    belongs_to :assessment
    belongs_to :report
    include Tenantable

    tenant_source :assessment

    has_one :dimension, through: :assessment
    has_one :project, through: :campaign
    has_one :option, foreign_key: :threesixty_campaign_id, dependent: :destroy
    has_one :project_datasheet, through: :campaign
    has_one :campaign_datasheet, through: :campaign, class_name: 'Datasheet'
    has_one :campaign_options, through: :campaign
    has_one :report_approval_setting, primary_key: :campaign_id, dependent: :destroy

    has_many :nomination_requirements, foreign_key: :threesixty_campaign_id, dependent: :destroy
    has_many :participants, through: :campaign
    has_many :campaign_users, through: :campaign
    has_many :subjects, through: :campaign
    has_many :evaluators, through: :campaign
    has_many :user_assessments, through: :campaign
    has_many :email_templates, foreign_key: :threesixty_campaign_id, dependent: :destroy
    has_many :email_schedules, foreign_key: :threesixty_campaign_id, dependent: :destroy
    has_many :instruction_templates, foreign_key: :threesixty_campaign_id, dependent: :destroy
    has_many :users_results, through: :campaign
    has_many :reminder_histories, foreign_key: :threesixty_campaign_id, dependent: :destroy
    has_many :email_histories, foreign_key: :threesixty_campaign_id, dependent: :destroy
    has_many :license_usages, through: :campaign

    delegate :client, :datasheet_column_names, :datasheet_data, :name, :subjects, :evaluators,
             :project, :participants, :datasheet, to: :campaign
    delegate :logo, to: :client

    enum :category, { normal: 0, skill_rater: 1 }

    EMPTY = 'empty'
    STANDARD_360 = 'standard_360'
    PREVIOUS_360 = 'previous_360'

    TYPES = {
      EMPTY => 'Empty',
      STANDARD_360 => 'Standard 360',
      PREVIOUS_360 => 'Previous 360'
    }.freeze

    def log_attribute_for_delete
      slice(:campaign_id, :assessment_id, :report_id)
    end

    def available_relationships
      Relationship.where(campaign_id: [campaign.id, nil]).where.not(name: 'Assessor')
    end

    def campaign_report
      @campaign_report ||= CampaignReport.includes(:report).find_by!(report_id: report_id, campaign_id: campaign_id)
    end

    def campaign_report_default_locale
      campaign_report.effective_default_language
    end
  end
end
