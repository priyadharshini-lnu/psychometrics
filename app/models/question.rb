# == Schema Information
#
# Table name: questions
#
#  id         :integer          not null, primary key
#  name       :string
#  position   :integer
#  type       :string
#  props      :json
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  block_id   :integer
#

class Question < ApplicationRecord
  belongs_to :block
  has_many :comments, -> { order(id: :asc) }

  validates :name, :type, :block, presence: true
  validates :name, length: { maximum: 255 }, allow_blank: true
end
