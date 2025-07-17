# frozen_string_literal: true

require 'rails_helper'

describe Sheets::RemoveColumns do
  let(:sheet) do
    create(:sheet)
  end
  let(:column1) { create(:sheet_column, name: 'Profile', sheet: sheet) }
  let(:column2) { create(:sheet_column, name: 'Empty', sheet: sheet) }

  let!(:row) do
    create(:sheet_row, sheet: sheet, email: 'james@cc.com').tap do |row|
      row.sheet_row_data.create(sheet_column: column1, string_value: 'carpenter')
      row.sheet_row_data.create(sheet_column: column2, string_value: nil)
    end
  end

  it 'should remove column and data from rows' do
    expect(row.column_names).to eq(%w[Profile Empty])

    described_class.call!(sheet, [column1.id])

    expect(row.reload.column_names).to eq(%w[Empty])
  end

  it 'should remove columns and data from rows' do
    expect(row.column_names).to eq(%w[Profile Empty])

    described_class.call!(sheet, [column1.id, column2.id])

    expect(row.reload.column_names).to eq(%w[])
  end

  it 'should remove columns with single and double quote' do
    sheet = create(:sheet)
    column3 = create(:sheet_column, name: 'Quote"', sheet: sheet)

    row = create(:sheet_row, sheet: sheet, email: 'james@cc.com').tap do |r|
      r.sheet_row_data.create(sheet_column: column3, string_value: nil)
    end
    described_class.call!(sheet, [column3.id])

    expect(row.reload.column_names).to eq(%w[])
  end
end
