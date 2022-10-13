# frozen_string_literal: true

require 'rails_helper'

describe Sheets::RemoveColumns do
  let(:sheet) do
    create(:sheet, columns: [{ name: 'Email', type: 'String' },
                             { name: 'Profile', type: 'Text' },
                             { name: 'Empty', type: 'Number' }])
  end
  let!(:row) do
    create(:sheet_row, sheet: sheet, email: 'james@cc.com',
      data: { 'Profile' => 'carpenter', 'Empty' => nil })
  end

  it 'should remove column and data from rows' do
    expect(row.data.keys).to eq(%w[Profile Empty])

    described_class.call!(sheet, ['Profile'])

    expect(row.reload.data.keys).to eq(%w[Empty])
  end

  it 'should remove columns and data from rows' do
    expect(row.data.keys).to eq(%w[Profile Empty])

    described_class.call!(sheet, %w[Profile Empty])

    expect(row.reload.data.keys).to eq(%w[])
  end

  it 'should remove columns with single and double quote' do
    sheet = create(:sheet, columns: [{ name: 'Email', type: 'String' },
                                     { name: 'Profile', type: 'Text' },
                                     { name: 'Quote"', type: 'Number' }])
    row = create(:sheet_row, sheet: sheet, email: 'james@cc.com',
      data: { 'Profile' => 'carpenter', 'Quote"' => nil })
    described_class.call!(sheet, ['Quote"'])

    expect(row.reload.data.keys).to eq(%w[Profile])
  end
end
