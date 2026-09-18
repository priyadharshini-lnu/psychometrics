# frozen_string_literal: true

class Api::V2::Administration::MembershipResource < Api::V2::Administration::BaseResource
  attributes :user_id, :client_id, :project_id, :campaign_id, :name, :first_name, :last_name, :email, :created_at,
             :role, :grant_names, :admin_role_ids

  has_one :user
  has_many :admin_roles

  ransack_filters %i[client_id_eq campaign_id_eq project_id_eq user_id_eq with_role filterable_fields]

  delegate :first_name, :first_name=, :last_name, :last_name=, :name, :email, :email=, to: :user, allow_nil: true

  before_save :set_user_as_admin, on: :create

  alias_attribute :project_id, :client_id

  after_create :send_invitation_email

  audit_log_for :create, payload: '*'
  audit_log_for :update, payload: '*'
  audit_log_for :destroy, payload: ->(_, record) { record.log_attribute_for_delete }

  def self.records(opts)
    scope = super.includes(:admin_roles)
    return scope if opts[:context][:params].dig('filter', 'user_id_eq').present?

    scope.joins(:user).where.not(users: { role: User::APPLICATION_ROLE })
  end

  def set_user_as_admin
    if @model.user.new_record?
      @model.user.create_by_invite = true
      @model.user.role = 'Users::Admin'
    end
  end

  def user
    @model.user || @model.build_user(role: UserRoles::ADMIN_ROLE)
  end

  def user_id
    user&.id&.to_s
  end

  def send_invitation_email
    @model.reload.user.invite!(context[:current_user], @model)
  end

  def self.sortable_fields(context)
    super + [:'user.email']
  end

  def grant_names
    @model.grants&.data
  end

  def grant_names=(new_fields)
    if @model.grants
      @model.grants.data = new_fields
    else
      @model.build_grants(data: new_fields)
    end
  end

  def user_id=(new_fields)
    @model.user_id = new_fields[0]
  end

  def created_at
    I18n.l(@model.created_at, format: :short)
  end
end
