class NormImportForm < BaseForm
  attr_accessor :file

  validates :file, presence: true,
                   file_size: { less_than_or_equal_to: 4.megabytes },
                   file_content_type: { allow: [
                                                   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                                   'application/vnd.ms-excel'
                                               ]
                                       }
end
