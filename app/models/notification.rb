# == Schema Information
#
# Table name: notifications
#
#  id            :integer          not null, primary key
#  text          :string
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  assessment_id :integer
#  membership_id :integer
#

class Notification < ApplicationRecord
  validates :text, presence: true
  belongs_to :membership
  belongs_to :assessment
end
