# frozen_string_literal: true

class OwnerPermissionValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    resource_name = record.class.table_name.to_sym
    user = record.new_record? ? record.created_by : record.updated_by
    unless user.has_permission?(resource_name, :manage, project_id: value)
      record.errors.add(
        attribute,
        I18n.t(
          'administration.assessments.errors.owner_validation',
          resource_name: resource_name,
          permission: 'manage',
          client_name: record.owner.name
        )
      )
    end
  end
end
