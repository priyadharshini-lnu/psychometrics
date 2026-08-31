# frozen_string_literal: true

class Api::V2::Administration::CommunicationTemplateResource < Api::V2::Administration::BaseResource
  attributes :name, :kind, :level, :status, :recipients_default, :delivery_defaults,
             :subject, :body, :available_locales, :created_at, :updated_at

  has_one :client, class_name: 'Client'
  has_one :project, class_name: 'Client'
  has_one :campaign
  has_one :inherits_from, class_name: 'CommunicationTemplate',
                          relation_name: :inherits_from_template,
                          foreign_key: 'inherits_from_template_id'

  ransack_filters %i[
    filterable_fields
    name_cont
    kind_eq
  ]

  filter :level_eq, apply: ->(records, _value, _options) { records }
  filter :client_id_eq, apply: ->(records, _value, _options) { records }
  filter :project_id_eq, apply: ->(records, _value, _options) { records }
  filter :campaign_id_eq, apply: ->(records, _value, _options) { records }
  filter :include_inherited, apply: ->(records, _value, _options) { records }

  # Ransack doesn't apply the model's enum type-casting for eq/in predicates (e.g. status_in: ['archived']
  # would compile to `status IN (0)`, matching `draft`, since 'archived'.to_i == 0) -- map to the underlying
  # enum values ourselves instead, same workaround already used in workshop_subject_resource.rb.
  filter :status_eq, apply: lambda { |records, values, _options|
    enum_value = CommunicationTemplate.statuses[values[0]]
    enum_value ? records.where(status: enum_value) : records.none
  }

  filter :status_in, apply: lambda { |records, values, _options|
    enum_values = values.filter_map { |value| CommunicationTemplate.statuses[value] }
    enum_values.any? ? records.where(status: enum_values) : records.none
  }

  before_save :derive_scope_from_hierarchy

  before_create do
    @model.created_by_id = context[:user].id
    @model.updated_by_id = context[:user].id
  end

  before_update do
    @model.updated_by_id = context[:user].id
  end

  def derive_scope_from_hierarchy
    if @model.campaign_id.present?
      campaign = Campaign.find_by(id: @model.campaign_id)
      @model.project_id ||= campaign&.project_id
    end

    if @model.project_id.present?
      project = Client.find_by(id: @model.project_id)
      @model.client_id ||= project&.parent_id
    end
  end

  def available_locales
    @model.translations.pluck(:locale).uniq.presence || [I18n.default_locale.to_s]
  end

  def self.records(opts = {})
    scope = policy_scoped_records(opts)
    filter = opts.dig(:context, :params, 'filter') || {}
    conditions = visible_scope_conditions(filter)
    return scope.none if conditions.empty?

    conditions.map { |condition| scope.where(condition) }.reduce(:or)
  end

  def self.policy_scoped_records(opts)
    Api::Administration::CommunicationTemplatePolicy::Scope.new(
      opts[:context][:user],
      CommunicationTemplate
    ).resolve
  end

  def self.visible_scope_conditions(filter)
    chain = scope_chain(filter)
    return [] if chain.empty?

    include_inherited?(filter) ? chain : [chain.last]
  end

  def self.include_inherited?(filter)
    ActiveModel::Type::Boolean.new.cast(filter['include_inherited'])
  end

  def self.scope_chain(filter)
    case filter['level_eq']
      when 'platform' then platform_chain
      when 'client' then client_chain(filter['client_id_eq'])
      when 'project' then project_chain(filter['project_id_eq'])
      when 'campaign' then campaign_chain(filter['campaign_id_eq'])
      else []
    end
  end

  def self.platform_chain
    [{ level: :platform }]
  end

  def self.client_chain(client_id)
    return [] if client_id.blank?

    platform_chain + [{ level: :client, client_id: client_id }]
  end

  def self.project_chain(project_id)
    return [] if project_id.blank?

    client_id = Client.find_by(id: project_id)&.parent_id
    ancestors = client_id.present? ? client_chain(client_id) : platform_chain
    ancestors + [{ level: :project, project_id: project_id }]
  end

  def self.campaign_chain(campaign_id)
    return [] if campaign_id.blank?

    project_id = Campaign.where(id: campaign_id).pick(:project_id)
    ancestors = project_id.present? ? project_chain(project_id) : platform_chain
    ancestors + [{ level: :campaign, campaign_id: campaign_id }]
  end

  def self.sortable_fields(_context)
    super + %i[name kind level status]
  end
end
