# frozen_string_literal: true

require 'rails_helper'

describe DatasheetDataQuery do
  let!(:campaign) { create(:campaign) }
  let!(:sheet) do
    create(:sheet, campaign: campaign)
  end
  let!(:columns) do
    [
      create(:sheet_column, sheet: sheet, name: 'First', column_type: 'string'),
      create(:sheet_column, sheet: sheet, name: 'Second', column_type: 'number'),
      create(:sheet_column, sheet: sheet, name: 'Third', column_type: 'string')
    ]
  end
  let!(:sheet_rows) { create(:sheet_row, sheet: sheet, email: 'test@email.com') }

  let!(:sheet_row_data) do
    create(:sheet_row_datum, sheet_row: sheet_rows, sheet_column: columns[0], string_value: 'test')
    create(:sheet_row_datum, sheet_row: sheet_rows, sheet_column: columns[1], numeric_value: 3.5)
  end

  it 'should return the data for the sheet rows with all columns' do
    result = described_class.new(sheet, limit: 10, offset: 0).query

    expect(result.first).to eq({
      'ID' => sheet_rows.id,
      'Email' => 'test@email.com',
      'First' => 'test',
      'Second' => '3.5',
      'Third' => nil
    })
  end

  it 'should return the data for the sheet rows with all columns with nil value' do
    create(:sheet_row_datum, sheet_row: sheet_rows, sheet_column: columns[2])
    result = described_class.new(sheet, limit: 10, offset: 0).query

    expect(result.first).to eq({
      'ID' => sheet_rows.id,
      'Email' => 'test@email.com',
      'First' => 'test',
      'Second' => '3.5',
      'Third' => nil
    })
  end

  it 'should return the data for the sheet rows with all columns with value' do
    create(:sheet_row_datum, sheet_row: sheet_rows, sheet_column: columns[2], numeric_value: 1)
    result = described_class.new(sheet, limit: 10, offset: 0).query

    expect(result.first).to eq({
      'ID' => sheet_rows.id,
      'Email' => 'test@email.com',
      'First' => 'test',
      'Second' => '3.5',
      'Third' => '1'
    })
  end
end
