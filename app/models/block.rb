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

  before_create :init

  def init
    self.props ||= Settings.block.default_buttons
  end
end
