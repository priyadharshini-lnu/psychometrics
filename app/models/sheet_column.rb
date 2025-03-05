# frozen_string_literal: true

class SheetColumn < ApplicationRecord
  COLUMN_TYPES = {
    'Email' => 0,
    'Number' => 1,
    'String' => 2,
    'Text' => 3,
    'Markdown' => 4,
    'HTML' => 5
  }.freeze

  ADVANCE_TYPES = %w[html markdown].freeze

  belongs_to :sheet
  has_many :sheet_row_data, dependent: :destroy

  acts_as_list scope: :sheet, top_of_list: 0
  enum :column_type, { email: 0, number: 1, string: 2, text: 3, markdown: 4, html: 5 }

  def humanize_type
    COLUMN_TYPES.key(SheetColumn.column_types[column_type])
  end
end
