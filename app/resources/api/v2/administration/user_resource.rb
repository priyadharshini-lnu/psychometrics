# frozen_string_literal: true

class Api::V2::Administration::UserResource < Api::V2::Administration::BaseResource
  attributes :name, :email, :first_name, :last_name, :full_name, :updated_at, :disabled, :enable_2fa,
             :created_by, :modified_by, :role

  ransack_filters %i[admins search_query with_access_to_campaign filterable_fields role_eq]

  def full_name
    name
  end

  def name
    @model.decorate.display_name
  end

  def updated_at
    @model.decorate.updated_at
  end

  def created_by
    @model.creator&.decorate&.display_name
  end

  def modified_by
    @model.modifier&.decorate&.display_name
  end

  def meta(_options)
    {
      permissions: {
        reset_password: Api::Administration::UserPolicy.new(context[:user], _model).reset_password?
      }
    }
  end

  def self.records(opts = {})
    super.includes(:creator, :modifier)
  end
end
