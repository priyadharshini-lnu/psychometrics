# == Schema Information
#
# Table name: memberships
#
#  id             :integer          not null, primary key
#  client_id      :integer
#  user_id        :integer
#  parent_id      :integer
#  lft            :integer
#  rgt            :integer
#  depth          :integer
#  children_count :integer
#  hris           :jsonb
#  disabled       :boolean          default(FALSE)
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  role           :string           default("member")
#  is_retail      :boolean          default(FALSE)
#

class Membership < ApplicationRecord
  include Userable

  # Roles constant
  MEMBERSHIP_ROLES = [
    ADMIN_ROLE = 'admin'.freeze,
    MANAGER_ROLE = 'manager'.freeze,
    MEMBER_ROLE = 'member'.freeze
  ].freeze

  SCOPES = {
    ADMIN_ROLE => :administration,
    MANAGER_ROLE => :user,
    MEMBER_ROLE => :user
  }.freeze

  belongs_to :client
  belongs_to :user, inverse_of: :memberships, touch: true
  accepts_nested_attributes_for :user

  has_many :assigns, dependent: :destroy, inverse_of: :membership
  has_many :reports, through: :assigns

  has_many :assessments, through: :assigns
  has_many :communication_emails, inverse_of: :membership, foreign_key: :membership_id, class_name: 'CommunicationEmail'
  has_many :orders, dependent: :destroy, inverse_of: :membership, class_name: 'Ecommerce::Order'

  validates :client, uniqueness: { scope: :user }

  validates :client, :user, presence: true
  validates :client_id, uniqueness: { scope: :user_id }
  validates :role, inclusion: { in: MEMBERSHIP_ROLES }, presence: true

  before_validation :ensure_user, on: :create, if: proc { user_id.nil? }
  # before_create :use_license

  after_destroy :remove_subtenancy_memberships, if: -> { client.tenancy? }

  acts_as_nested_set scope: :client_id

  scope :enabled, -> { where.not(disabled: true) }
  scope :admin_role, -> { where(role: ADMIN_ROLE) }
  scope :with_head_assigns_for_client_and_assessment, lambda { |client_id, assessment_id|
    joining { assigns.on(assigns.membership_id.eq(id) & assigns.assessment_id.eq(assessment_id) & assigns.role.in([Assign.roles[:admin], Assign.roles[:manager]])) }.
      where.has { |m| m.client_id.eq(client_id) }
  }
  scope :with_client, lambda { |client_id|
    where(client_id: client_id)
  }
  scope :join_user, lambda {
    joining { user }.selecting { ['memberships.*', user.first_name, user.last_name, user.email, user.role.as('user_role'), user.is_anonym] }
  }
  scope :hris_data_cont, lambda { |data|
    data = JSON.parse(data) if data.is_a?(String)
    return if data.blank?
    where('memberships.hris @> ?', data.to_json)
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
  scope :client_reports, ->(client_ids) { select('reports.*').where(client_id: client_ids).joins(:reports) }

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

  def use_license
    Licenses::UsersLicense.use(self)
  end

  # Ensure that Membership has User record
  #   Else initialize new User with specified first and last names
  def ensure_user
    self.user = User.find_or_initialize_by(email: email)
    user.assign_attributes(first_name: first_name, last_name: last_name, create_by_invite: true) if user.new_record?
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

  private

  def remove_subtenancy_memberships
    # TODO: remove sub campaigns
    # user.memberships.where(client_id: client.sub_client_ids).destroy_all
  end

  class << self
    # White list scopes for Ransack
    def ransackable_scopes(_auth_object = nil)
      [:hris_data_cont, :role_scope_in, :user_type_eq, :assigns_hash_id_eq]
    end
  end
end
