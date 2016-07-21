class NormImportForm < BaseForm
  attr_accessor :file

  validates :file, presence: true
  validates :file, file_size: { less_than_or_equal_to: 4.megabytes },
            file_content_type: { allow: %w(image/jpeg, image/png) }
end
