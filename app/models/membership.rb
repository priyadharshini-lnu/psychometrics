# == Schema Information
#
# Table name: memberships
#
#  id        :integer          not null, primary key
#  client_id :integer
#  user_id   :integer
#

class Membership < ApplicationRecord
  belongs_to :client, counter_cache: :licenses_used
  belongs_to :user, inverse_of: :memberships
  accepts_nested_attributes_for :user

  has_many :assigns, dependent: :destroy, inverse_of: :membership
  has_many :assessments, through: :assigns
  has_many :communication_emails, inverse_of: :membership, foreign_key: :membership_id, class_name: 'CommunicationEmail'

  acts_as_nested_set scope: :client_id

  validates :client, :user, presence: true
  validates :client_id, uniqueness: { scope: :user_id }

  scope :enabled, -> { where.not(disabled: true) }
  scope :with_head_assigns_for_client_and_assessment, lambda { |client_id, assessment_id|
    joining { assigns.on(assigns.membership_id.eq(id) & assigns.assessment_id.eq(assessment_id) & assigns.role.in([Assign.roles[:admin], Assign.roles[:manager]])) }.
      where.has { |m| m.client_id.eq(client_id) }
  }
  scope :with_client, lambda { |client_id|
    where(client_id: client_id)
  }
  scope :join_user, lambda {
    joining { user }.selecting { ['memberships.*', user.first_name, user.last_name, user.email, user.role, user.is_anonym] }
  }
  scope :exclude_ids, lambda { |ids|
    ids = ids.split(',') if ids.is_a?(String)
    ids = (ids || []).reject(&:blank?).compact
    where.not(id: ids)
  }
  scope :include_ids, lambda { |ids|
    ids = ids.split(',') if ids.is_a?(String)
    ids = (ids || []).reject(&:blank?).compact
    where(id: ids)
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

  class << self
    # White list scopes for Ransack
    def ransackable_scopes(_auth_object = nil)
      [:hris_data_cont, :role_scope_in, :exclude_ids, :include_ids, :user_type_eq, :assigns_hash_id_eq]
    end
  end
end
