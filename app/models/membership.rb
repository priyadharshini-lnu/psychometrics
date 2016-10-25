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

  acts_as_nested_set scope: [:client_id]

  validates :client, :user, presence: true
  validates :client_id, uniqueness: { scope: :user_id }

  scope :with_client, lambda { |client_id|
    where(client_id: client_id)
  }
end
