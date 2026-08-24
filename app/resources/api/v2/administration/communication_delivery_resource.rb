# frozen_string_literal: true

class Api::V2::Administration::CommunicationDeliveryResource < Api::V2::Administration::BaseResource
  attributes :trigger_type, :status, :delivery_rule, :recipients,
             :delivery_at,
             :delivery_interval_number, :delivery_interval_period,
             :delivery_start_date, :delivery_end_date,
             :delivery_time_of_day, :delivery_timezone,
             :delivery_frequency, :delivery_weekdays,
             :delivery_delay_hours, :assessment_completion_status_code,
             :campaign_assessment_group_id,
             :subject, :body, :available_locales, :communication_delivery_users_attributes,
             :communication_delivery_cc_users_attributes, :communication_delivery_assessments_attributes,
             :emails_count, :emails_sent_count,
             :created_at, :updated_at

  has_one :communication_template
  has_one :campaign
  has_one :project

  ransack_filters %i[status_eq]

  filter :campaign_id_eq, apply: ->(records, _value, _options) { records }
  filter :project_id_eq, apply: ->(records, _value, _options) { records }

  before_create do
    @model.created_by_id = context[:user].id
    @model.updated_by_id = context[:user].id
  end

  def self.records(opts = {})
    filter = opts.dig(:context, :params, 'filter') || {}
    campaign_id = filter['campaign_id_eq']
    project_id = filter['project_id_eq']
    return CommunicationDelivery.none if campaign_id.blank? && project_id.blank?

    scoped = policy_scoped_records(opts)
    scoped = scoped.where(campaign_id: campaign_id) if campaign_id.present?
    scoped = scoped.where(project_id: project_id) if project_id.present?
    scoped
  end

  def self.policy_scoped_records(opts)
    Api::Administration::CommunicationDeliveryPolicy::Scope.new(
      opts[:context][:user],
      CommunicationDelivery
    ).resolve
  end

  def communication_delivery_users_attributes
    return [] unless @model.persisted?

    @model.communication_delivery_users.map { |delivery_user| { user_id: delivery_user.user_id } }
  end

  def communication_delivery_users_attributes=(value)
    return if value.nil?

    @model.communication_delivery_users_attributes = value
  end

  def communication_delivery_cc_users_attributes
    return [] unless @model.persisted?

    @model.communication_delivery_cc_users.map { |cc_user| { user_id: cc_user.user_id } }
  end

  def communication_delivery_cc_users_attributes=(value)
    return if value.nil?

    @model.communication_delivery_cc_users_attributes = value
  end

  def communication_delivery_assessments_attributes
    return [] unless @model.persisted?

    @model.communication_delivery_assessments.map { |assessment| { assessment_id: assessment.assessment_id } }
  end

  def communication_delivery_assessments_attributes=(value)
    return if value.nil?

    @model.communication_delivery_assessments_attributes = value
  end

  def available_locales
    @model.translations.pluck(:locale).uniq.presence || [I18n.default_locale.to_s]
  end

  def emails_count
    @model.emails.count
  end

  def emails_sent_count
    @model.emails.sent.count
  end
end
