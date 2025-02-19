# frozen_string_literal: true

class DevelopmentAction < ApplicationRecord
  extend Mobility
  include ActiveStorageSync
  include ActiveStorageAttachable
  include RansackSearchableFields

  translates :name, :description

  belongs_to :project
  has_many :skills_development_actions, dependent: :destroy
  has_many :skills, through: :skills_development_actions
  has_many :course_schedules, dependent: :destroy

  enum category: {
    course: 0,
    default: 1
  }

  enum learning_style: {
    on_the_job: 0,
    learning_from_others: 1,
    structured_learning: 2
  }

  # Use has_one_image_attachment with default variants
  has_one_image_attachment :image, variants: %i[thumb small medium]

  # Validate image content type and size
  validates :image, content_type: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'],
                   size: { less_than: 100.megabytes },
                   if: -> { image.attached? }

  validate :validate_end_date_after_start_date,
           if: -> { course? && course_start_date.present? && course_end_date.present? }

  before_save :clear_course_data, if: -> { category_changed? && default? }

  def self.ransackable_attributes(_auth_object = nil)
    %w[name]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[course_schedules image_attachment image_blob project skills skills_development_actions translations]
  end

  # Add helper method to get human readable category names
  def self.category_options
    categories.map do |key, _value|
      [key.humanize, key]
    end
  end

  private

  def validate_end_date_after_start_date
    return if course_start_date.blank? || course_end_date.blank?

    if course_end_date < course_start_date
      errors.add(:course_end_date, 'must be after start date')
    end
  end

  def clear_course_data
    self.course_url = nil
    self.course_start_date = nil
    self.course_end_date = nil
    image.purge_later
  end

  def attachment_storage_path(attribute_name, filename)
    "public/development_action/#{id}/#{attribute_name}/#{filename}"
  end
end
