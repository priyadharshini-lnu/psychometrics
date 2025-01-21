# frozen_string_literal: true

require 'spec_helper'

RSpec.describe ExcelSafe do
  let!(:package) { ExcelSafe.new }
  let!(:workbook) { package.workbook }
  let!(:sheet) do
    package.add_worksheet('Test Sheet') do |sheet|
      # This block is required by the add_worksheet method
    end
    workbook.worksheets.first
  end

  describe '#initialize' do
    it 'initializes a new workbook' do
      expect(package.workbook).not_to be_nil
    end
  end

  describe '#add_worksheet' do
    it 'adds a worksheet with the given name' do
      expect(package.workbook.worksheets.map(&:name)).to include('Test Sheet')
    end

    it 'extends the worksheet with ExcelSafeExtensions' do
      expect(sheet.singleton_class.included_modules).to include(ExcelSafe::ExcelSafeExtensions)
    end
  end

  describe '#add_row' do
    it 'sanitizes the row before adding it' do
      row = ['=SUM(A1:A10)', 'Normal Text', 123]
      sanitized_row = ["'=SUM(A1:A10)", 'Normal Text', 123]

      sheet.add_row(row)

      expect(sheet.rows.last.cells.map(&:value)).to eq(sanitized_row)
    end
  end
end
