# == Schema Information
#
# Table name: dimensions
#
#  id            :integer          not null, primary key
#  name          :string
#  disabled      :boolean          default(FALSE)
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  factors_count :integer          default(0)
#
class Occupation < ApplicationRecord
  has_many :occupations_factors
  belongs_to :dimension

  validates :name, presence: true
  validates :name, length: { maximum: 150 }, allow_blank: true
end
