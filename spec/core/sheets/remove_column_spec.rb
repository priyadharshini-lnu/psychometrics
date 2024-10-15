# frozen_string_literal: true

require 'rails_helper'

describe Sheets::RemoveColumns do
  let(:sheet) do
    create(:sheet, columns: [{ name: 'Email', type: 'String' },
                             { name: 'Profile', type: 'Text' },
                             { name: 'Empty', type: 'Number' }])
  end
  let(:column1) { create(:sheet_column, name: 'Profile', sheet: sheet) }
  let(:column2) { create(:sheet_column, name: 'Empty', sheet: sheet) }

  let!(:row) do
    create(:sheet_row, sheet: sheet, email: 'james@cc.com',
      data: { 'Profile' => 'carpenter', 'Empty' => nil })
  end

  it 'should remove column and data from rows' do
    expect(row.data.keys).to eq(%w[Profile Empty])

    described_class.call!(sheet, [column1.id])

    expect(row.reload.data.keys).to eq(%w[Empty])
  end

  it 'should remove columns and data from rows' do
    expect(row.data.keys).to eq(%w[Profile Empty])

    described_class.call!(sheet, [column1.id, column2.id])

    expect(row.reload.data.keys).to eq(%w[])
  end

  it 'should remove columns with single and double quote' do
    sheet = create(:sheet, columns: [{ name: 'Email', type: 'String' },
                                     { name: 'Profile', type: 'Text' },
                                     { name: 'Quote"', type: 'Number' }])
    column3 = create(:sheet_column, name: 'Quote"', sheet: sheet)

    row = create(:sheet_row, sheet: sheet, email: 'james@cc.com',
      data: { 'Profile' => 'carpenter', 'Quote"' => nil })
    described_class.call!(sheet, [column3.id])

    expect(row.reload.data.keys).to eq(%w[Profile])
  end
end
