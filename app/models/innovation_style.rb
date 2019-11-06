# frozen_string_literal: true

# == Schema Information
#
# Table name: innovation_styles
#
#  id            :bigint(8)        not null, primary key
#  name          :string
#  icon          :string
#  description   :text
#  dimension_id  :bigint(8)         not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#

class InnovationStyle < ApplicationRecord
  include RansackSearchableFields

  has_many :innovation_styles_factors
  belongs_to :dimension

  validates :name, presence: true
  validates :name, length: { maximum: 150 }, allow_blank: true

  validates :position, numericality: { only_integer: true }, allow_nil: true

  mount_uploader :icon, ImageUploader
end
