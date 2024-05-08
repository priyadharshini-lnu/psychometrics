# frozen_string_literal: true

class DevelopmentAction < ApplicationRecord
  extend Mobility
  include ActiveStorageSync

  translates :name, :description

  belongs_to :owner, optional: true, class_name: 'Client'
  has_many :skills_development_actions, dependent: :destroy
  has_many :skills, through: :skills_development_actions
  has_many :course_schedules, dependent: :destroy

  enum category: { development_actions: 0, online_course: 1, offline_course: 2 }
  enum learning_style: { structured_learning: 0, learning_from_others: 1, on_the_job: 2 }

  mount_uploader :image, Public::ImageUploader
end
