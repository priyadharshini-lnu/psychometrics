# frozen_string_literal: true

require 'axlsx'

class ExcelSafe < Axlsx::Package
  def initialize
    super()
    @workbook = workbook
  end

  def add_worksheet(name)
    @workbook.add_worksheet(name: name) do |sheet|
      sheet.extend(ExcelSafeExtensions)
      yield(sheet)
    end
  end

  module ExcelSafeExtensions
    def add_row(row, style: nil)
      sanitized_row = sanitize_row(row)
      super(sanitized_row, style: style)
    end

    private

    def starts_with_special_character?(str)
      str.start_with?('-', '=', '+', '@', '%', '|', '\r', '\t')
    end

    def prefix(field)
      "'#{field}"
    end

    def prefix_if_necessary(field)
      as_string = field.to_s
      if starts_with_special_character?(as_string)
        prefix(as_string)
      else
        field
      end
    end

    def sanitize_field(field)
      if field.nil? || field.is_a?(Numeric)
        field
      else
        prefix_if_necessary(field)
      end
    end

    def sanitize_row(row)
      row.map { |field| sanitize_field(field) }
    end
  end
end
