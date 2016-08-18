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
#  props         :json
#

class Block < ApplicationRecord
  belongs_to :assessment
  has_many :questions, -> { order(position: :asc) }

  validates :name, presence: true
  validates :name, length: { maximum: 150 }, allow_blank: true

  scope :deleted, -> { where.not(deleted_at: nil) }

  def deep_clone(name:, position:)
    cloned_block = dup
    cloned_block.position = position if position
    cloned_block.name = name if name
    cloned_block.save
    cloned_block.questions.create(questions.map { |question| question.attributes.except('id', 'created_at', 'updated_at') })
    cloned_block
  end

  #
  # Move down all questions, which have position more than base_position
  #
  def increment_all_questions(base_position)
    questions.where("position > #{base_position}").update_all('position = position + 1')
  end
end
