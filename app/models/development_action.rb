# frozen_string_literal: true

class DevelopmentAction < ApplicationRecord
  extend Mobility
  include ActiveStorageSync
  include ActiveStorageAttachable
  include RansackSearchableFields

  translates :name, :description
  acts_as_taggable_on :tags

  belongs_to :owner, polymorphic: true, optional: true
  belongs_to :project, foreign_key: :owner_id, class_name: 'Client', optional: true
  include Tenantable

  has_many :skills_development_actions, dependent: :destroy
  has_many :skills, through: :skills_development_actions
  has_many :course_schedules, dependent: :destroy
  has_many :user_idp_development_actions, dependent: :destroy

  validates :name, :description, presence: true

  def name
    name_translation = super
    return name_translation if name_translation.present?

    translations.where.not(name: nil).order(:created_at).limit(1).pick(:name)
  end

  def description
    description_translation = super
    return description_translation if description_translation.present?

    translations.where.not(description: nil).order(:created_at).limit(1).pick(:description)
  end

  def project
    owner if owner_type == 'Client'
  end

  def project_id
    owner_id if owner_type == 'Client'
  end

  def project_id=(id)
    if id.present?
      self.owner_type = 'Client'
      self.owner_id = id
    else
      self.owner_type = nil
      self.owner_id = nil
    end
  end

  scope :global, ->(_value = nil) { where(owner_id: nil) }

  enum :development_action_type, {
    course: 0,
    default: 1
  }

  enum :learning_style, {
    on_the_job: 0,
    learning_from_others: 1,
    structured_learning: 2
  }

  enum :source_type, {
    platform: 0,
    ai_generated: 1,
    custom: 2
  }

  # Use has_one_image_attachment with default variants
  has_one_image_attachment :image, variants: %i[thumb small medium]

  # Validate image content type and size
  validates :image, content_type: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'],
                   size: { less_than: 100.megabytes },
                   if: -> { image.attached? }

  validates :name, presence: true, if: -> { platform? || custom? }

  validate :validate_end_date_after_start_date,
           if: -> { course? && course_start_date.present? && course_end_date.present? }

  before_save :clear_course_data, if: -> { development_action_type_changed? && default? }

  ransacker :project_id do |parent|
    Arel::Nodes::Case.new.
      when(parent.table[:owner_type].eq('Client')).
      then(parent.table[:owner_id])
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[name source_type]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[course_schedules image_attachment image_blob owner project skills skills_development_actions translations
       user_idp_development_actions]
  end

  def self.ransackable_scopes(_auth_object = nil)
    %w[global filterable_fields]
  end

  # Add helper method to get human readable development_action_type names
  def self.development_action_type_options
    development_action_types.map do |key, _value|
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
