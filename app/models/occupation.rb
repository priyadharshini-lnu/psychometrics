# == Schema Information
#
# Table name: occupations
#
#  id                                 :integer          not null, primary key
#  name                               :string
#  icon                               :string
#  description                        :text
#  dimension_id                       :integer
#  created_at                         :datetime         not null
#  updated_at                         :datetime         not null
#  full_description                   :text
#  potential_areas_of_study           :text
#  key_career_tracks                  :text
#  high_school_entry_roles            :text
#  diploma_qualification              :text
#  bachelors_or_masters_qualification :text
#

class Occupation < ApplicationRecord
  has_many :occupations_factors
  belongs_to :dimension

  validates :name, presence: true
  validates :name, length: { maximum: 150 }, allow_blank: true
end
