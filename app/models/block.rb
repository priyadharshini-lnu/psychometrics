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
#

class Block < ApplicationRecord

  has_many :questions, -> { order(id: :asc) }
  validates :name, :position, presence: true
  validates :name, length: { maximum: 150 }, allow_blank: true

end
