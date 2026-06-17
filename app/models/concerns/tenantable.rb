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
    after_commit :cascade_tenant_id_to_dependents, if: :saved_change_to_tenant_id?, on: :update
  end

  TENANT_DERIVING_COLUMNS = %w[owner_id project_id client_id campaign_id].freeze
  DEPENDENT_REGISTRY = Hash.new { |h, k| h[k] = [] }

  class_methods do
    def tenant_source(*association_names)
      self.tenant_source_association = Array(association_names.flatten).map(&:to_sym)
      register_as_tenant_dependent
    end

    def register_as_tenant_dependent
      tenant_source_association.each do |assoc_name|
        reflection = reflect_on_association(assoc_name)
        next unless reflection&.macro == :belongs_to
        next if reflection.polymorphic?

        source_klass = reflection.klass.base_class
        fk = reflection.foreign_key.to_sym
        registry = Tenantable::DEPENDENT_REGISTRY[source_klass]
        registry << { klass: self, fk: fk } unless registry.any? { |e| e[:klass] == self }
      end
    end

    def tenant_dependents
      Tenantable::DEPENDENT_REGISTRY[base_class]
    end
  end

  private

  def should_resolve_tenant?
    return false unless has_attribute?(:tenant_id)
    return false if ActsAsTenant.current_tenant

    tenant_id.blank? || parent_association_changed?
  end

  def cascade_tenant_id_to_dependents
    ::Tenant::SyncDependentsJob.perform_later(self.class.base_class.name, id)
  end

  def parent_association_changed?
    persisted? && changed.intersect?(TENANT_DERIVING_COLUMNS)
  end

  def resolve_tenant_id
    resolved = resolved_tenant_id
    ActsAsTenant.with_mutable_tenant { self.tenant_id = resolved }
  end

  def sync_resolved_tenant_id!
    resolved = resolved_tenant_id
    return if tenant_id == resolved

    old_tenant_id = tenant_id
    ActsAsTenant.with_mutable_tenant { update_columns(tenant_id: resolved) }
    write_tenant_id_audit(old_tenant_id, resolved)
  end

  def write_tenant_id_audit(old_value, new_value)
    Audited.audit_class.create!(
      auditable_id: id,
      auditable_type: self.class.base_class.name,
      action: 'update',
      audited_changes: { 'tenant_id' => [old_value, new_value] }
    )
  rescue StandardError => e
    Rails.logger.warn("Failed to write tenant_id audit for #{self.class.name}##{id}: #{e.message}")
  end

  def resolve_tenant_from_source
    association_names = self.class.tenant_source_association
    return if association_names.blank?

    association_names.each do |association_name|
      parent = public_send(association_name)
      resolved = resolve_tenant_from_record(parent) || record_attribute(parent, :tenant_id)
      return resolved if resolved
    end

    nil
  end

  def resolved_tenant_id
    resolve_tenant_from_record(self) || resolve_tenant_from_source
  end

  def resolve_tenant_from_record(record)
    return unless record

    tenant_id_via(record, :campaign_id, Campaign) ||
      tenant_id_via(record, :threesixty_campaign_id, Threesixty::Campaign) ||
      tenant_id_via(record, :project_id, Client) ||
      tenant_id_via(record, :client_id, Client) ||
      tenant_id_via_owner(record)
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
