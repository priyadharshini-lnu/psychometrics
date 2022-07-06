# frozen_string_literal: true

require 'rails_helper'

describe ::DatasheetRows::GetData do
  let(:datasheet) do
    create(:datasheet, columns: [{ name: 'Email', type: 'String' },
                                 { name: 'Name', type: 'String' },
                                 { name: 'Profile', type: 'Text' }])
  end
  let(:datasheet_row) do
    create(:datasheet_row, datasheet: datasheet, email: 'james@cc.com',
      data: { 'Name' => 'James', 'Profile' => 'Software Engineer' })
  end

  it 'returns columns for all types if without_types options is not passed' do
    result = described_class.call!(datasheet_row)

    expect(result).to eq({ id: datasheet_row.id,
                           'Email' => 'james@cc.com', 'Name' => 'James', 'Profile' => 'Software Engineer' })
  end

  it "doesn't return columns of type passed in without_types options" do
    result = described_class.call!(datasheet_row, without_types: %w[Text])

    expect(result).to eq({ id: datasheet_row.id, 'Email' => 'james@cc.com', 'Name' => 'James' })
  end

  it 'uses the datasheet passed to get columns for which data needs to be extracted' do
    new_datasheet = create(:datasheet, columns: [{ name: 'Email', type: 'String' },
                                                 { name: 'Profile', type: 'Text' }])
    result = described_class.call!(datasheet_row, datasheet: new_datasheet)

    expect(result).to eq({ id: datasheet_row.id, 'Email' => 'james@cc.com', 'Profile' => 'Software Engineer' })
  end
end
