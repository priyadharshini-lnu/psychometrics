# frozen_string_literal: true

class Api::V2::Administration::MembershipResource < Api::V2::Administration::BaseResource
  attributes :user_id, :client_id, :campaign_id, :name, :first_name, :last_name, :email, :created_at, :grant_names,
             :role, :projects, :campaigns

  has_one :user

  ransack_filters %i[client_id_eq campaign_id_eq with_role filterable_fields]

  delegate :first_name, :first_name=, :last_name, :last_name=, :name, :email, :email=, to: :user, allow_nil: true

  before_save :set_user_as_admin, on: :create

  after_create :send_invitation_email

  def set_user_as_admin
    if @model.user.new_record?
      @model.user.create_by_invite = true
      @model.user.role = 'Users::Admin'
    end
  end

  def user
    @model.user || @model.build_user
  end

  def user_id
    user&.id&.to_s
  end

  def send_invitation_email
    @model.reload.user.invite!(context[:current_user], @model.client_id)
  end

  def self.sortable_fields(context)
    super + [:'user.email']
  end

  def grant_names
    @model.grants&.data
  end

  def grant_names=(new_fields)
    @model.build_grants(data: new_fields)
  end

  def user_id=(new_fields)
    @model.user_id = new_fields[0]
  end

  def created_at
    I18n.l(@model.created_at, format: :short)
  end

  def projects
    @model.user.project_admin_clients.map do |client|
      { id: client.id, name: client.name, role: 'project_admin' }
    end
  end

  def campaigns
    @model.user.campaign_admin_campaigns.map do |campaign|
      { id: campaign.id, name: campaign.name, role: 'campaign_admin' }
    end
  end
end
