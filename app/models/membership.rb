# == Schema Information
#
# Table name: memberships
#
#  id                    :integer          not null, primary key
#  client_id             :integer
#  user_id               :integer
#  hris                  :jsonb
#  disabled              :boolean          default(FALSE)
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
#  is_retail             :boolean          default(FALSE)
#  assigns_count         :integer          default(0)
#  assigns_completed     :boolean          default(FALSE)
#  project_membership_id :integer
#  ancestry              :string
#  role                  :integer          default("member"), not null
#

class Membership < ApplicationRecord
  # Roles constant
  MEMBERSHIP_ROLES = [
      MEMBER_ROLE = 'member'.freeze,
      MANAGER_ROLE = 'manager'.freeze,
      ADMIN_ROLE = 'admin'.freeze,
  ].freeze

  SCOPES = {
      ADMIN_ROLE => :administration,
      MANAGER_ROLE => :user,
      MEMBER_ROLE => :user
  }.freeze

  enum role: MEMBERSHIP_ROLES
  delegate :is_anonym?, to: :user

  belongs_to :client, counter_cache: :users_count
  belongs_to :user, inverse_of: :memberships, touch: true
  belongs_to :project_membership, foreign_key: :project_membership_id, class_name: 'Membership'
  accepts_nested_attributes_for :user

  has_many :assigns, inverse_of: :membership # on delete cascade
  has_many :reports, through: :assigns
  has_many :assessments, through: :assigns
  has_many :communication_emails, inverse_of: :membership, foreign_key: :membership_id, class_name: 'CommunicationEmail' # on delete cascade
  has_many :orders, inverse_of: :membership, class_name: 'Ecommerce::Order' # on delete cascade
  has_many :clients_memberships, foreign_key: :project_membership_id, class_name: 'Membership' # on delete cascade
  has_many :clients_assigns, through: :clients_memberships, source: :assigns, class_name: 'Assign'
  has_many :clients_reports, through: :clients_assigns, source: :reports

  validates :client, :user, presence: true
  validates :client_id, uniqueness: { scope: [:user_id, :role] }
  validates :role, inclusion: { in: MEMBERSHIP_ROLES }, presence: true
  validate :relevant_role
  validate :client_admin_scope, if: 'admin?'

  before_save :set_project_membership, if: 'client.end_level?'
  after_destroy :clear_project_membership, if: 'client.end_level?'

  has_ancestry

  scope :enabled, -> { where.not(disabled: true) }
  scope :assigned, -> { joins(:assigns) }
  scope :completed, -> { where(assigns_completed: true) }
  scope :admin_role, -> { where(role: ADMIN_ROLE) }
  scope :with_client, -> (client_id) { where(client_id: client_id) }
  scope :user_reports, -> (client_ids) { select('reports.*').where(client_id: client_ids).joins(:reports) }

  scope :with_head_assigns_for_client_and_assessment, lambda { |client_id, assessment_id|
    joining { assigns.on(assigns.membership_id.eq(id) & assigns.assessment_id.eq(assessment_id) & assigns.role.in([Assign.roles[:admin], Assign.roles[:manager]])) }.
        where.has { |m| m.client_id.eq(client_id) }
  }
  scope :join_user, lambda {
    joining { user }.selecting { ['memberships.*', user.first_name, user.last_name, user.email, user.role.as('user_role'), user.is_anonym] }
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
    begin
      decoded_id = Assign.decode_id(hash_id.to_s).first
      joins(:assigns).where(assigns: { id: decoded_id })
    rescue InputError
    end
  }

  # Save HRIS data from form
  def hris_data=(data)
    self.hris = {}
    data.values.each do |d|
      next if d['key'].blank?
      hris[d['key']] = d['value']
    end
  end

  def scope
    SCOPES[role]
  end

  # return true for new or overuse (:yti(:eti)) combinations
  def excess_yti_eti?(report)
    return true if !report.yti_eti? || reports.empty?
    hash = reports.yti_eti.group(:type).count.transform_keys { |k| Report.types.key(k) }
    hash.slice!(Report::ETI_TYPE, Report::YTI_TYPE)
    report_type_count = hash[report.type]
    return true if hash.empty?
    return false if report_type_count.nil?
    count_arr = hash.values
    count_arr.delete count
    return true if count_arr.empty? || count_arr.max < report_type_count
    false
  end

  def project?
    project_membership_id.nil?
  end

  private

  def set_project_membership
    return if client.project? || project_membership.present?
    project_membership = client.project.memberships.where(user_id: user_id).take
    project_membership ||= Membership.create!(user_id: user_id, client_id: client.project.id)
    self.project_membership_id = project_membership.id
  rescue => e
    errors.add(:base, e.message)
    raise ActiveRecord::RecordInvalid
  end

  def clear_project_membership
    return if project_membership.nil? || project_membership.clients_memberships.any?
    project_membership.destroy!
  end

  def relevant_role
    valid = case role
      when ADMIN_ROLE
        client.project?
      when MANAGER_ROLE, MEMBER_ROLE
        client.end_level? || (project? && client.project?)
      else
        false
    end
    errors.add(:role, 'Invalid') unless valid
  end

  def client_admin_scope
    # user can be client admin only within one tenancy
    tte_id = user.admin_clients_tte_ids.sample
    return unless tte_id
    errors.add(:base, :admin_for_another_tte) if client.tte_id != tte_id
  end

  class << self
    # White list scopes for Ransack
    def ransackable_scopes(_auth_object = nil)
      [:hris_data_cont, :role_scope_in, :user_type_eq, :assigns_hash_id_eq]
    end
  end
end
