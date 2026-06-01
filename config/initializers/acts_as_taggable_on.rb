# frozen_string_literal: true

# TODO: Remove the tenant column and this compatibility module later.
#
# - The tenant string column is optional in acts_as_taggable_on and not required for basic tagging.
# - With acts_as_tenant, this tenant column becomes redundant and can be removed in the future.
module TaggingTenantCompatibility
  def tenant
    read_attribute(:tenant)
  end

  def tenant=(value)
    if value.is_a?(ActiveRecord::Base)
      self.tenant_id = value.id
      write_attribute(:tenant, value.id.to_s)
    else
      self.tenant_id = value.presence
      write_attribute(:tenant, value.to_s)
    end
  end
end

Rails.application.config.to_prepare do
  next if ActsAsTaggableOn::Tagging.respond_to?(:scoped_by_tenant?)

  ActsAsTaggableOn::Tagging.instance_variable_set(:@tenant_config_options, { has_global_records: true, optional: true })
  ActsAsTaggableOn::Tagging.include(Tenantable)
  ActsAsTaggableOn::Tagging.tenant_source :taggable
  ActsAsTaggableOn::Tagging.prepend(TaggingTenantCompatibility)
end

ActsAsTaggableOn::Tag.class_eval do
  def self.ransackable_associations(_auth_object = nil)
    ['taggings']
  end

  def self.ransackable_attributes(_auth_object = nil)
    ['name']
  end
end

ActsAsTaggableOn::Tagging.class_eval do
  def self.ransackable_attributes(_auth_object = nil)
    %w[taggable_id taggable_type tag_id]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[tag taggable]
  end
end
