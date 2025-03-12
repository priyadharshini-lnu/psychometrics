# frozen_string_literal: true

require 'rails_helper'

describe SheetRows::GetData do
  let(:sheet) do
    create(:sheet, columns: [{ name: 'Email', type: 'String' },
                             { name: 'Name', type: 'String' },
                             { name: 'Profile', type: 'Text' }])
  end
  let!(:columns) do
    [
      create(:sheet_column, sheet: sheet, name: 'Email', column_type: 'string'),
      create(:sheet_column, sheet: sheet, name: 'Name', column_type: 'string'),
      create(:sheet_column, sheet: sheet, name: 'Profile', column_type: 'text')
    ]
  end
  let(:sheet_row) do
    r1 = create(:sheet_row, sheet: sheet, email: 'james@cc.com')
    create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[0], string_value: 'james@cc.com')
    create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[1], string_value: 'James')
    create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[2], string_value: 'Software Engineer')
    r1
  end

  it 'returns columns for all types if without_types options is not passed' do
    result = described_class.call!(sheet_row)

    expect(result).to eq({ id: sheet_row.id,
                           'Email' => 'james@cc.com', 'Name' => 'James', 'Profile' => 'Software Engineer' })
  end

  it "doesn't return columns of type passed in without_types options" do
    result = described_class.call!(sheet_row, without_types: %w[text])

    expect(result).to eq({ id: sheet_row.id, 'Email' => 'james@cc.com', 'Name' => 'James' })
  end

  it 'uses the sheet passed to get columns for which data needs to be extracted' do
    new_sheet = create(:sheet, columns: [{ name: 'Email', type: 'String' },
                                         { name: 'Profile', type: 'Text' }])
    create(:sheet_column, sheet: new_sheet, name: 'Email', column_type: 'string')
    create(:sheet_column, sheet: new_sheet, name: 'Profile', column_type: 'text')
    columns[0].update(sheet: new_sheet)
    columns[2].update(sheet: new_sheet)
    result = described_class.call!(sheet_row, sheet: new_sheet)

    expect(result).to eq({ id: sheet_row.id, 'Email' => 'james@cc.com', 'Profile' => 'Software Engineer' })
  end
end
