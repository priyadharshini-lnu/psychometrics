class NormImportForm < BaseForm
  attr_accessor :file

  validates :file, presence: true
  validates file_size:   { less_than_or_equal_to: 4.megabytes },
      file_content_type: { allow: ['text/csv'] }
end
