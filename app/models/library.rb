# == Schema Information
#
# Table name: libraries
#
#  id             :integer          not null, primary key
#  name           :string
#  description    :text
#  type           :integer          default("folder")
#  file           :string
#  parent_id      :integer
#  lft            :integer          not null
#  rgt            :integer          not null
#  depth          :integer          default(0), not null
#  children_count :integer          default(0), not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#

class Library < ApplicationRecord
  acts_as_nested_set

  enum type: [:folder, :image, :audio, :video, :other]

  mount_uploader :file, FileUploader

  validates :name, presence: true, if: proc { folder? }
  validates :file, presence: true, unless: proc { folder? }
  validates_inclusion_of :type, in: Library.types.keys

  # Detect which type of library we saving
  # folder, image, audio, video, other
  before_save :detected_type
  before_create :set_name, unless: proc { folder? }

  # Search entity by word
  scope :search_query, lambda { |query|
    where('name ILIKE ?', "%#{query}%")
  }

  # Sorting
  scope :sorted_by, lambda { |sort_key|
    # extract the sort direction from the param value.
    direction = sort_key =~ /desc$/ ? 'desc' : 'asc'
    column = sort_key.gsub("_#{direction}", '')
    if column.in?(%w(id name type created_at updated_at))
      order("libraries.#{column} #{direction}")
    end
  }

  # Search folders and files which have parent
  scope :with_parent, lambda { |parent_id|
    parent_id = nil if parent_id.to_i.zero?
    where.has { |libraries| libraries.parent_id == parent_id }
  }

  scope :with_type, lambda { |type|
    return if type.blank?
    where.has { |libraries| (libraries.type == type) | (libraries.type == :folder) }
  }

  #
  # Disables single column inheritance
  #
  self.inheritance_column = :_type_disabled

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
