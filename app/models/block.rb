# == Schema Information
#
# Table name: blocks
#
#  id            :integer          not null, primary key
#  name          :string
#  position      :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  assessment_id :integer
#  deleted_at    :datetime
#

class Block < ApplicationRecord
  belongs_to :assessment
  has_many :questions, -> { order(position: :asc) }

  validates :name, presence: true
  validates :name, length: { maximum: 150 }, allow_blank: true

  acts_as_list scope: :assessment
  acts_as_paranoid
end
