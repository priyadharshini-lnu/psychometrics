# frozen_string_literal: true

# == Schema Information
#
# Table name: occupations
#
#  id                                 :integer          not null, primary key
#  name                               :string
#  icon                               :string
#  alternative_icon                   :string
#  indicative_roles_image             :string
#  key_career_tracks_image            :string
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
#  work_environment                   :text
#

class Occupation < ApplicationRecord
  include RansackSearchableIdField

  has_many :occupations_factors
  belongs_to :dimension

  validates :name, presence: true
  validates :name, length: { maximum: 150 }, allow_blank: true

  mount_uploader :alternative_icon, ImageUploader
  mount_uploader :icon, ImageUploader
  mount_uploader :indicative_roles_image, ImageUploader
  mount_uploader :key_career_tracks_image, ImageUploader

  ransack_searchable_id_field
end
