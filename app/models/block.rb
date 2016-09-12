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
  include Copyable

  belongs_to :assessment
  belongs_to :original, class_name: 'Block'
  has_many :questions, -> { order(position: :asc) }
  has_many :blocks, class_name: 'Block', foreign_key: :original_id


  validates :name, presence: true
  validates :name, length: { maximum: 150 }, allow_blank: true

  scope :deleted, -> { where.not(deleted_at: nil) }

  enum view: [:assessment, :qcenter]

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
  def shift_down_all_questions(base_position)
    questions.where("position > #{base_position}").update_all('position = position + 1')
  end
end
