# frozen_string_literal: true

class Membership < ApplicationRecord
  include GeoFilterable

  audited

  include SecurityContextLoggable

  # Roles constant
  MEMBERSHIP_ROLES = [
    MEMBER_ROLE = 'member',
    MANAGER_ROLE = 'manager',
    PROJECT_ADMIN_ROLE = 'project_admin',
    CLIENT_ADMIN_ROLE = 'client_admin',
    CAMPAIGN_ADMIN_ROLE = 'campaign_admin'
  ].freeze

  SCOPES = {
    PROJECT_ADMIN_ROLE => :administration,
    CLIENT_ADMIN_ROLE => :administration,
    CAMPAIGN_ADMIN_ROLE => :administration,
    MANAGER_ROLE => :user,
    MEMBER_ROLE => :user
  }.freeze

  include ::Facades::Administration::EmailDelivery

  enum :role, MEMBERSHIP_ROLES

  delegate :is_anonym?, to: :user

  belongs_to :client
  belongs_to :campaign
  belongs_to :user, inverse_of: :memberships, touch: true
  belongs_to :project_membership, class_name: 'Membership'
  include Tenantable

  accepts_nested_attributes_for :user

  has_and_belongs_to_many :communications, join_table: :communications_memberships
  has_many :communication_emails,
           inverse_of: :membership, class_name: 'CommunicationEmail' # on delete cascade
  has_many :clients_memberships, foreign_key: :project_membership_id, class_name: 'Membership' # on delete cascade
  has_many :memberships_admin_roles, dependent: :destroy
  has_many :admin_roles, through: :memberships_admin_roles, dependent: :destroy

  has_one :original_membership, foreign_key: :project_membership_id, class_name: 'Membership'
  has_one :hogan_credential, -> { active }, dependent: :destroy
  has_one :grants, class_name: 'MembershipGrant'

  accepts_nested_attributes_for :grants

  has_many :privacy_consents
  has_many :reports_accesses
  has_many :accessible_reports, -> { where(reports_accesses: { user_access: true }) },
           through: :reports_accesses, source: :report

  validates :client, :user, presence: true
  validates :client_id, uniqueness: { scope: %i[user_id role campaign_id] }
  validates :role, inclusion: { in: MEMBERSHIP_ROLES }, presence: true
  validate :relevant_role, if: -> { client.present? }

  before_save :set_project_membership, if: -> { client.end_level? }
  # Standard saved_change_to_role? checks fail in after_commit for this model,
  # due to conflicts with external gems (e.g. audited).
  # We must manually capture changes before save to ensure logging occurs.
  before_save :capture_security_changes
  after_destroy :clear_project_membership, if: -> { client.end_level? }
  after_commit :log_security_context_change, on: :update

  attr_accessor :role_change_tuple

  def capture_security_changes
    changes_to_role = changes['role']
    self.role_change_tuple = changes_to_role if changes_to_role.present?
  end

  def log_security_context_change
    return unless role_change_tuple

    msg = "Membership role changed from #{role_change_tuple[0]} to #{role_change_tuple[1]} " \
          "for client #{client_id}"

    log_security_context_event(
      target_user: user,
      msg: msg
    )
  end

  has_ancestry

  scope :enabled, -> { where.not(disabled: true) }
  # scope :assigned, -> { joins(:assigns) }
  # scope :completed, -> { where(assigns_completed: true) }
  scope :client_admin_role, -> { where(role: CLIENT_ADMIN_ROLE) }
  scope :project_admin_role, -> { where(role: PROJECT_ADMIN_ROLE) }
  scope :campaign_admin_role, -> { where(role: CAMPAIGN_ADMIN_ROLE) }
  scope :with_client, ->(client_id) { where(client_id: client_id) }
  scope :with_role, ->(role) { where(role: role) }
  scope :project_id_eq, ->(project_id) { where(client_id: project_id) }
  scope :user_reports, ->(client_ids) { select('reports.*').where(client_id: client_ids).joins(:reports) }
  scope :filterable_fields, lambda { |query|
    if (query !~ /\D/) && query.present?
      joins(:user).where('users.id = ? OR users.first_name ILIKE ? OR users.last_name ILIKE ? OR users.email ILIKE ?',
                         query, "%#{query}%", "%#{query}%", "%#{query}%")
    else
      joins(:user).where('users.first_name ILIKE ? OR users.last_name ILIKE ? OR users.email ILIKE ?',
                         "%#{query}%", "%#{query}%", "%#{query}%")
    end
  }
  scope :join_user, lambda {
    joins(:user).select(
      'memberships.*',
      'users.disabled',
      'users.first_name',
      'users.last_name',
      'users.email',
      'users.role AS user_role',
      'users.is_anonym',
      'memberships.disabled AS membership_disabled'
    )
  }
  scope :hris_data_cont, lambda { |data|
    data = JSON.parse(data) if data.is_a?(String)
    where('memberships.hris @> ?', data.to_json) if data.any?
  }
  scope :user_type_eq, lambda { |type|
    case type.to_s
      when 'identified'
        joins(:user).where.not(users: { is_anonym: true })
      when 'anonymous'
        joins(:user).where(users: { is_anonym: true })
    end
  }
  attr_accessor :through_registration

  def self.scoped_by_client(restricted_client_subquery)
    return all if restricted_client_subquery.blank?

    joins(:client).where(
      'clients.id NOT IN (?) AND (clients.tte_id IS NULL OR clients.tte_id NOT IN (?))',
      restricted_client_subquery,
      restricted_client_subquery
    )
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name campaign_id project_id campaign_id client_id user_id]
  end

  # Save HRIS data from form
  def hris_data=(data)
    self.hris = {}
    data.each_value do |d|
      next if d['key'].blank?

      hris[d['key']] = d['value']
    end
  end

  def scope
    SCOPES[role]
  end

  def set_user_invited_for_current_project
    return if already_invited?

    update_columns(already_invited: true)
  end

  def project?
    project_membership_id.nil?
  end

  def project
    membership_with_result.client
  end

  def already_invited?
    project_membership&.already_invited || already_invited
  end

  def membership_with_result
    project_membership || self
  end

  def accepted_privacy?
    # TODO: (atanych): this logic will be broken when we add new types of consents
    privacy_consents.take.present?
  end

  def has_grants_through_role?(scope, grant)
    admin_roles.any? do |admin_role|
      admin_role = admin_role.user_role_specific_permissions(self)
      admin_role.key?(scope.to_s) && admin_role[scope.to_s]&.include?(grant.to_s)
    end
  end

  def has_grant?(scope, grant)
    return true if has_grants_through_role?(scope, grant)

    return false unless grants

    grants.has_grant?(scope, grant)
  end

  def log_attribute_for_delete
    slice(:user_id).merge({ email: user.email })
  end

  private

  def set_project_membership
    return if client.project? || project_membership.present?

    project_membership = client.project.memberships.find_by(user_id: user_id)
    project_membership ||= Membership.create!(user_id: user_id, client_id: client.project.id)
    self.project_membership_id = project_membership.id
  rescue StandardError => e
    errors.add(:base, e.message)
    raise ActiveRecord::RecordInvalid
  end

  def clear_project_membership
    return if project_membership.nil? || project_membership.clients_memberships.any?

    project_membership.destroy!
  end

  def relevant_role
    valid = case role
              when CLIENT_ADMIN_ROLE
                client.tenancy?
              when PROJECT_ADMIN_ROLE
                client.project?
              when MANAGER_ROLE, MEMBER_ROLE
                client.end_level? || (project? && client.project?)
              when CAMPAIGN_ADMIN_ROLE
                campaign.present?
              else
                false
            end
    errors.add(:role, 'Invalid') unless valid
  end

  class << self
    # White list scopes for Ransack
    def ransackable_scopes(_auth_object = nil)
      %i[hris_data_cont role_scope_in user_type_eq filterable_fields with_role project_id_eq]
    end
  end
end
