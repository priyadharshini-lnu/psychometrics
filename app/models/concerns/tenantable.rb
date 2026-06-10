# frozen_string_literal: true

module Tenantable
  extend ActiveSupport::Concern

  included do
    unless respond_to?(:scoped_by_tenant?)
      config = @tenant_config_options || {}
      acts_as_tenant(:tenant, class_name: 'Client', foreign_key: :tenant_id, **config)
    end

    class_attribute :tenant_source_association

    before_validation :resolve_tenant_id, if: :should_resolve_tenant?
  end

  TENANT_DERIVING_COLUMNS = %w[owner_id project_id client_id campaign_id].freeze

  class_methods do
    def tenant_source(*association_names)
      self.tenant_source_association = Array(association_names.flatten).map(&:to_sym)
    end
  end

  private

  def should_resolve_tenant?
    return false unless has_attribute?(:tenant_id)
    return false if ActsAsTenant.current_tenant

    tenant_id.blank? || parent_association_changed?
  end

  def parent_association_changed?
    persisted? && changed.intersect?(TENANT_DERIVING_COLUMNS)
  end

  def resolve_tenant_id
    resolved = resolve_tenant_from_record(self) || resolve_tenant_from_source
    return unless resolved

    ActsAsTenant.with_mutable_tenant { self.tenant_id = resolved }
  end

  def resolve_tenant_from_source
    association_names = self.class.tenant_source_association
    return if association_names.blank?

    association_names.each do |association_name|
      parent = public_send(association_name)
      resolved = resolve_tenant_from_record(parent)
      return resolved if resolved
    end

    nil
  end

  def resolve_tenant_from_record(record)
    return unless record

    tenant_id_via(record, :campaign_id, Campaign) ||
      tenant_id_via(record, :threesixty_campaign_id, Threesixty::Campaign) ||
      tenant_id_via(record, :project_id, Client) ||
      tenant_id_via(record, :client_id, Client) ||
      tenant_id_via_owner(record) ||
      record_attribute(record, :tenant_id)
  end

  def tenant_id_via(record, fk_column, klass)
    id = record_attribute(record, fk_column)
    return unless id

    klass.where(id: id).pick(:tenant_id)
  end

  def tenant_id_via_owner(record)
    id = record_attribute(record, :owner_id)
    return unless id

    reflection = record.class.reflect_on_association(:owner)

    if reflection&.polymorphic?
      owner_type = record_attribute(record, :owner_type)
      return unless owner_type

      owner_type.constantize.where(id: id).pick(:tenant_id)
    else
      owner_klass = reflection&.klass || Client
      owner_klass.where(id: id).pick(:tenant_id)
    end
  end

  def record_attribute(record, column)
    return unless record.respond_to?(:has_attribute?)
    return unless record.has_attribute?(column.to_s)

    record.public_send(column)
  end
end
