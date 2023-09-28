# frozen_string_literal: true

class Library < ApplicationRecord
  include OwnerValidations
  include ActiveStorageAttachable
  # temporary include syncable library to keep sync between CarrierWave and ActiveStorage
  # TODO: remove after migration to ActiveStorage
  include ActiveStorageSync

  belongs_to :owner, class_name: 'Client'
  belongs_to :created_by, class_name: 'User'
  belongs_to :updated_by, class_name: 'User'
  has_ancestry

  enum type: { folder: 0, image: 1, audio: 2, video: 3, other: 4 }

  mount_uploader :file, Public::FileUploader

  has_one_attachment :as_file, content_type: %w[jpg jpeg gif png mp3 mp4 wma avi pdf svg csv xlsx xls]
  # TODO: remove after migration to ActStor
  # list of CarrierWave attributes to be synced to ActiveStorage
  sync_to_active_storage :file

  def attachment_storage_path(attribute_name, filename)
    "public/library/#{attribute_name}/#{filename}"
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

    where.has { |libraries| (libraries.type == type) | (libraries.type == :folder) }
  }

  #
  # Disables single column inheritance
  #
  self.inheritance_column = :_type_disabled

  def log_attribute_for_delete
    slice(:name, :owner_id)
  end

  protected

  def detected_type
    return self.type = :folder if file.file.nil?
    return self.type = :image if !!file.file && file.content_type.start_with?('image')
    return self.type = :audio if !!file.file && file.content_type.start_with?('audio')
    return self.type = :video if !!file.file && file.content_type.start_with?('video')

    self.type = :other
  end

  def set_name
    self.name = file.filename if name.blank?
  end
end
