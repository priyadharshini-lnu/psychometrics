# frozen_string_literal: true

class Api::V2::Administration::UserResource < Api::V2::Administration::BaseResource
  attributes :name, :email, :first_name, :last_name, :full_name, :updated_at, :disabled, :enable_2fa,
             :created_by, :modified_by, :role, :project_id

  has_one :user_profile, foreign_key_on: :related
  delegate :photo_url, to: :user_profile, allow_nil: true

  ransack_filters %i[admins search_query with_access_to_campaign with_campaign_user filterable_fields role_eq]

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

  def meta_details
    {
      permissions: lambda {
        GetPermissionsHash.call!(
          Api::Administration::UserPolicy,
          context[:user],
          @model,
          [
            %w[remove destroy],
            'reset_password',
            'toggle_enable_2fa'
          ],
          {
            project_id: @model.project_id
          }
        )
      }
    }
  end

  def self.records(opts = {})
    role_based_class = case opts[:context][:params][:filter][:role_eq]
                         when User::REGULAR_ROLE
                           Users::Regular
                         when User::ADMIN_ROLE
                           Users::Admin
                         when User::SUPER_ADMIN_ROLE
                           Users::SuperAdmin
                         else
                           User
                       end

    ::Pundit.policy_scope!(
      opts[:context][:user], [:api, :administration, role_based_class]
    ).includes(:creator, :modifier)
  end
end
