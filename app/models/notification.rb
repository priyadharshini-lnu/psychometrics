# == Schema Information
#
# Table name: notifications
#
#  id         :integer          not null, primary key
#  text       :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Notification < ApplicationRecord
  validates :text, presence: true
  belongs_to :client
  belongs_to :user
end
