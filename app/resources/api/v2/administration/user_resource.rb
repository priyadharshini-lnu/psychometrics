# frozen_string_literal: true

class Api::V2::Administration::UserResource < Api::V2::Administration::BaseResource
  attributes :name, :email, :first_name, :last_name, :full_name, :updated_at, :disabled, :enable_2fa,
             :created_by, :modified_by, :role, :project_id, :photo_url, :user_profile_data, :access_locked
  has_one :user_profile, foreign_key_on: :related

  delegate :photo_url, to: :user_profile, allow_nil: true

  after_save lambda {
    @model.user_profile.update!(@user_profile_data)
  }

  ransack_filters %i[admins search_query with_access_to_campaign with_campaign_user filterable_fields role_eq
                     global_assessor_eq role_in]

  audit_log_for :create, payload: '*'
  audit_log_for :update, payload: '*'
  audit_log_for :destroy, payload: ->(_, user) { user.log_attributes }

  def full_name
    name
  end

  def user_profile_data=(data)
    @user_profile_data = data.permit(:locale, :timezone)
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

  def access_locked
    @model.access_locked?
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
            'toggle_enable_2fa',
            %w[login_as spoof],
            'unlock_user_access'
          ],
          {
            project_id: @model.project_id
          }
        )
      }
    }
  end

  def self.records(opts = {})
    super.includes(:creator, :modifier)
  end

  def fetchable_fields
    super - [:user_profile_data]
  end
end
