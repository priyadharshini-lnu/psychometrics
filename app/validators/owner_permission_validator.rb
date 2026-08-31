# frozen_string_literal: true

class OwnerPermissionValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    resource_name = record.class.table_name.to_sym
    user = record.new_record? ? record.created_by : record.updated_by
    project_id = resource_name == :communications ? record.project_id : value
    campaign_id = resource_name == :communications ? record.campaign_id : nil

    return true if user.nil? || user.is?(:superadmin) || record.skip_owner_validation

    unless user.has_permission?(resource_name, :manage, project_id: project_id, campaign_id: campaign_id)
      record.errors.add(
        attribute,
        I18n.t(
          'administration.assessments.errors.owner_validation',
          resource_name: resource_name,
          permission: 'manage',
          client_name: record.owner&.name || I18n.t('admin.platform_owner')
        )
      )
    end
  end
end
