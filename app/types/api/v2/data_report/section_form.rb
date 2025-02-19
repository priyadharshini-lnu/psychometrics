# frozen_string_literal: true

module Api::V2::DataReport
  class SectionForm < Rectify::Form
    attribute :name
    attribute :cell_format
    attribute :columns

    validates :name, :cell_format, :columns, presence: true
    validate :validate_columns, if: -> { columns.present? }

    def validate_columns
      columns.each.with_index do |column, column_num|
        form = ::Api::V2::DataReport::ColumnForm.new(column).with_context(context)
        form.validate
        err = form.errors.full_messages.join(', ')
        errors.add("column##{column_num + 1}: ", err) if err.present?
      end
    end
  end
end
