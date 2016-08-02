class Membership < ApplicationRecord
  belongs_to :client, counter_cache: :licenses_used
  belongs_to :user

  validates :client, :user, presence: true
  validates :client_id, uniqueness: { scope: :user_id }
end
