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
#  deleted_at :datetime
#

class Question < ApplicationRecord
  belongs_to :block
  has_many :comments, -> { order(position: :asc) }

  #
  # Disables single column inheritance
  #
  self.inheritance_column = :_type_disabled

  validates :name, :type, presence: true
  validates :name, length: { maximum: 255 }, allow_blank: true

  acts_as_list scope: :block
  acts_as_paranoid
end
