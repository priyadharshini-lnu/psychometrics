# frozen_string_literal: true

class Api::V2::Administration::CommunicationEmailResource < Api::V2::Administration::BaseResource
  attributes :sent_at, :created_at, :status, :error_code, :error_message, :attempts
  attribute :recipient_name
  attribute :recipient_email
  attribute :subject

  has_one :communication_delivery

  filter :communication_delivery_id_eq, apply: ->(records, _value, _options) { records }

  def recipient_name
    @model.user&.name
  end

  def recipient_email
    @model.user&.email
  end

  def subject
    @model.content_source.subject(@model.user&.locale)
  end

  def self.records(opts = {})
    filter = opts.dig(:context, :params, 'filter') || {}
    delivery_id = filter['communication_delivery_id_eq']

    scope = policy_scoped_records(opts)
    delivery_id.present? ? scope.where(communication_delivery_id: delivery_id) : scope
  end

  def self.policy_scoped_records(opts)
    Api::Administration::CommunicationEmailPolicy::Scope.new(opts[:context][:user], CommunicationEmail).resolve
  end
end
