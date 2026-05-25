# frozen_string_literal: true

class Library < ApplicationRecord
  audited

  include OwnerValidations
  include ActiveStorageAttachable
  include RansackSearchableFields

  belongs_to :owner, class_name: 'Client'
  belongs_to :created_by, class_name: 'User'
  belongs_to :updated_by, class_name: 'User'
  has_ancestry

  include Tenantable

  enum :type, { folder: 0, image: 1, audio: 2, video: 3, other: 4 }

  has_one_attachment :file,
                     content_type: %w[jpg jpeg gif png mp3 mp4 wma avi pdf svg csv xlsx xls pptx ppt docx doc zip],
                     variants: [:icon]

  def attachment_storage_path(attribute_name, filename)
    "public/library/#{id}/#{attribute_name}/#{filename}"
  end

  validates :name, presence: true, if: proc { folder? }
  validates :file, presence: true, unless: proc { folder? }
  validates :type, inclusion: { in: Library.types.keys }
  validates :owner, presence: true, allow_nil: true

  # Detect which type of library we saving
  # folder, image, audio, video, other
  before_save :detected_type
  before_create :set_name, unless: proc { folder? }

  # Search entity by word
  scope :search_query, lambda { |query|
    where('name ILIKE ?', "%#{query}%")
  }

  # Search folders and files which have parent
  scope :with_parent, lambda { |parent_id|
    if parent_id.to_i.zero?
      roots
    else
      children_of(parent_id)
    end
  }

  scope :with_type, lambda { |type|
    return if type.blank?

    where(type: [Library.types[type.to_s], Library.types['folder']])
  }

  #
  # Disables single column inheritance
  #
  self.inheritance_column = :_type_disabled

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name type created_at updated_at]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[parent]
  end

  def self.ransackable_scopes(_)
    %i[with_parent filterable_fields]
  end

  def log_attribute_for_delete
    slice(:name, :owner_id)
  end

  protected

  def detected_type
    return self.type = :image if file.image?
    return self.type = :audio if file.audio?
    return self.type = :video if file.video?
    return self.type = :folder unless file.attached?

    self.type = :other
  end

  def set_name
    self.name = file.filename if name.blank?
  end
end
