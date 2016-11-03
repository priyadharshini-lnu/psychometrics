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

  has_many :assigns, dependent: :destroy
  has_many :assessments, through: :assigns

  acts_as_nested_set scope: :client_id

  validates :client, :user, presence: true
  validates :client_id, uniqueness: { scope: :user_id }

  scope :with_client, lambda { |client_id|
    where(client_id: client_id)
  }
  scope :join_user, lambda {
    joins(:user).select('memberships.*', 'first_name, last_name, email, role')
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
      [:hris_data_cont, :role_scope_in, :exclude_ids, :include_ids]
    end
  end
end
