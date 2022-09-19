# frozen_string_literal: true

require 'rails_helper'

describe ::SheetRows::GetData do
  let(:sheet) do
    create(:sheet, columns: [{ name: 'Email', type: 'String' },
                             { name: 'Name', type: 'String' },
                             { name: 'Profile', type: 'Text' }])
  end
  let(:sheet_row) do
    create(:sheet_row, sheet: sheet, email: 'james@cc.com',
      data: { 'Name' => 'James', 'Profile' => 'Software Engineer' })
  end

  it 'returns columns for all types if without_types options is not passed' do
    result = described_class.call!(sheet_row)

    expect(result).to eq({ id: sheet_row.id,
                           'Email' => 'james@cc.com', 'Name' => 'James', 'Profile' => 'Software Engineer' })
  end

  it "doesn't return columns of type passed in without_types options" do
    result = described_class.call!(sheet_row, without_types: %w[Text])

    expect(result).to eq({ id: sheet_row.id, 'Email' => 'james@cc.com', 'Name' => 'James' })
  end

  it 'uses the sheet passed to get columns for which data needs to be extracted' do
    new_sheet = create(:sheet, columns: [{ name: 'Email', type: 'String' },
                                         { name: 'Profile', type: 'Text' }])
    result = described_class.call!(sheet_row, sheet: new_sheet)

    expect(result).to eq({ id: sheet_row.id, 'Email' => 'james@cc.com', 'Profile' => 'Software Engineer' })
  end
end
