# frozen_string_literal: true

require 'rails_helper'

describe Sheets::Export do
  let(:sheet) do
    create(:sheet, columns: [{ name: 'Email', type: 'String' },
                             { name: 'Profile', type: 'Text' },
                             { name: 'Empty', type: 'Number' }])
  end
  let!(:columns) do
    create(:sheet_column, sheet: sheet, name: 'Email', column_type: 'string')
    create(:sheet_column, sheet: sheet, name: 'Profile', column_type: 'text')
    create(:sheet_column, sheet: sheet, name: 'Empty', column_type: 'number')
  end
  let!(:sheet_row) do
    create(:sheet_row, sheet: sheet, email: 'james@cc.com')
  end
  let!(:sheet_row_data) do
    sheet_row.add_sheet_row_data(
      { 'Email' => 'james@cc.com', 'Profile' => 'carpenter' }
    )
  end
  let(:file_name) { "sheet-#{Time.zone.now}.xlsx" }

  after do
    FileUtils.rm_rf(file_name)
  end

  before do
    @xlsx = described_class.call!(sheet)
    @xlsx.serialize(file_name)
    @xlsx = Roo::Spreadsheet.open(file_name)
  end

  it 'returns sheet column name as a first row' do
    first_row = @xlsx.sheet(0).row(1)

    expect(first_row).to eq(%w[Email Profile Empty])
  end

  it 'returns sheet column type as second row' do
    first_row = @xlsx.sheet(0).row(2)

    expect(first_row).to eq(%w[String Text Number])
  end

  it 'returns sheet row value' do
    first_row = @xlsx.sheet(0).row(3)

    expect(first_row).to eq(%w[james@cc.com carpenter] + [nil])
  end
end
