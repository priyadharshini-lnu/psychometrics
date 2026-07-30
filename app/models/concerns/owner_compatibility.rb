# frozen_string_literal: true

module OwnerCompatibility
  extend ActiveSupport::Concern

  private

  def add_owner_compatibility_error(attribute, child_resource:, parent_resource:)
    errors.add(
      attribute,
      owner_compatibility_message(child_resource: child_resource, parent_resource: parent_resource)
    )
  end

  def owner_compatibility_message(child_resource:, parent_resource:)
    I18n.t(
      'admin.owner_resource_mismatch',
      child_resource: owner_resource_name(child_resource),
      parent_resource: owner_resource_name(parent_resource)
    )
  end

  def owner_resource_name(resource)
    I18n.t("admin.owner_resource_#{resource}")
  end

  def compatible_owner_ids?(owner_id, related_owner_id)
    if owner_id.nil?
      related_owner_id.nil?
    else
      related_owner_id == owner_id || related_owner_id.nil?
    end
  end
end
