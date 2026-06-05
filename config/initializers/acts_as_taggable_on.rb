# frozen_string_literal: true

Rails.application.config.to_prepare do
  ActsAsTaggableOn::Tagging.include(Tenantable)
  ActsAsTaggableOn::Tagging.tenant_source :taggable
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
