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
  include Copyable
  belongs_to :block
  has_many :comments

  scope :deleted, -> { where.not(deleted_at: nil) }

  #
  # Disables single column inheritance
  #
  self.inheritance_column = :_type_disabled

  validates :name, :type, presence: true
  validates :name, length: { maximum: 255 }, allow_blank: true

  #
  # Move down all questions, which have position more than base_position
  #
  def self.increment_all_positions(base_position)
    ::Question.where("position > #{base_position}").update_all('position = position + 1')
  end
end
