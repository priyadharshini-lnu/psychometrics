# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength
class Membership < ApplicationRecord
  audited

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

  enum role: MEMBERSHIP_ROLES

  delegate :is_anonym?, to: :user

  belongs_to :client
  belongs_to :campaign
  belongs_to :user, inverse_of: :memberships, touch: true
  belongs_to :project_membership, class_name: 'Membership'

  accepts_nested_attributes_for :user

  has_and_belongs_to_many :communications, join_table: :communications_memberships
  has_many :assigns, inverse_of: :membership # on delete cascade
  has_many :reports, through: :assigns
  has_many :assessments, through: :assigns
  has_many :communication_emails,
           inverse_of: :membership, class_name: 'CommunicationEmail' # on delete cascade
  has_many :clients_memberships, foreign_key: :project_membership_id, class_name: 'Membership' # on delete cascade
  has_many :clients_assigns, through: :clients_memberships, source: :assigns, class_name: 'Assign'
  has_many :clients_reports, through: :clients_assigns, source: :reports
  has_many :admin_roles, inverse_of: :membership

  has_one :original_membership, foreign_key: :project_membership_id, class_name: 'Membership'
  has_one :hogan_credential, dependent: :destroy
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
  after_create_commit :create_invitation_emails
  after_create_commit :create_other_emails
  after_destroy :clear_project_membership, if: -> { client.end_level? }

  has_ancestry

  scope :enabled, -> { where.not(disabled: true) }
  scope :assigned, -> { joins(:assigns) }
  scope :completed, -> { where(assigns_completed: true) }
  scope :client_admin_role, -> { where(role: CLIENT_ADMIN_ROLE) }
  scope :project_admin_role, -> { where(role: PROJECT_ADMIN_ROLE) }
  scope :campaign_admin_role, -> { where(role: CAMPAIGN_ADMIN_ROLE) }
  scope :with_client, ->(client_id) { where(client_id: client_id) }
  scope :with_role, ->(role) { where(role: role) }
  scope :project_id_eq, ->(project_id) { where(client_id: project_id) }
  scope :user_reports, ->(client_ids) { select('reports.*').where(client_id: client_ids).joins(:reports) }
  scope :member_or_manager, -> { where(role: %i[member manager]) }
  scope :filterable_fields, lambda { |query|
    if (query !~ /\D/) && query.present?
      joins(:user).where('users.id = ? OR users.first_name ILIKE ? OR users.last_name ILIKE ? OR users.email ILIKE ?',
                         query, "%#{query}%", "%#{query}%", "%#{query}%")
    else
      joins(:user).where('users.first_name ILIKE ? OR users.last_name ILIKE ? OR users.email ILIKE ?',
                         "%#{query}%", "%#{query}%", "%#{query}%")
    end
  }
  scope :with_head_assigns_for_client_and_assessment, lambda { |client_id, assessment_id|
    joining do
      assigns.on(assigns.membership_id.eq(id) &
                   assigns.assessment_id.eq(assessment_id) &
                   assigns.role.in([Assign.roles[:admin], Assign.roles[:manager]]))
    end.where.has { |m| m.client_id.eq(client_id) }
  }
  scope :join_user, lambda {
    joining { user }.selecting do
      [
        'memberships.*',
        user.disabled,
        user.first_name,
        user.last_name,
        user.email,
        user.role.as('user_role'),
        user.is_anonym,
        disabled.as('membership_disabled')
      ]
    end
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
  # Search users with specified Assign id (hashed)
  scope :assigns_hash_id_eq, lambda { |hash_id|
    decoded_id = Assign.decode_id(hash_id.to_s).first
    joins(:assigns).where(assigns: { id: decoded_id })
  }

  attr_accessor :through_registration

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
    admin_roles.any? do |role|
      role = role.grantable_permissions
      role.key?(scope.to_s) && role[scope.to_s]&.include?(grant.to_s)
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

  def create_invitation_emails
    return if already_invited?

    invite = invitation_for_current_membership
    if invite
      invite.emails.create(membership_id: id)
    elsif through_registration
      raw_token = Users::FindOrCreateInvitationToken.call!(user)
      InvitationMailer.invite(user_id, client_id, raw_token).deliver_later
    end
  end

  def create_other_emails
    communications = Communication.other.where(end_level_id: client.path_ids)
    communications = communications.send_now.
                     or(communications.specific_datetime.where('delivery_at <= ?', Time.current))
    communications.find_each(batch_size: 100) do |communication|
      communication.emails.create(membership_id: id) if communication.selected_memberships_ids.include?(id)
    end
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
                true
              else
                false
            end
    errors.add(:role, 'Invalid') unless valid
  end

  def invitation_for_current_membership
    Communication.new_users_recipients.invitation_for_end_level_id(client.path_ids).
      includes(:memberships).order(created_at: :desc).detect do |communication|
      communication.current_memberships_ids.include?(id)
    end
  end

  class << self
    # White list scopes for Ransack
    def ransackable_scopes(_auth_object = nil)
      %i[hris_data_cont role_scope_in user_type_eq assigns_hash_id_eq filterable_fields with_role project_id_eq]
    end
  end
end
# rubocop:enable Metrics/ClassLength
