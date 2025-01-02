# frozen_string_literal: true

require 'rails_helper'

describe ::SheetRows::UpsertData do
  let(:email) { Faker::Internet.email }
  let(:data) { { 'Name' => 'John' } }
  let(:campaign) { create(:campaign) }
  let(:project) { create(:project) }
  let(:sheet) { create(:sheet, campaign: campaign, type: 'Datasheet') }
  let(:sheet_column) { create(:sheet_column, sheet: sheet, name: 'Name') }
  let(:sheet_row) { create(:sheet_row, sheet: sheet, email: email) }

  subject { described_class.call(sheet, sheet_row.email, data) }

  before do
    sheet_column
    sheet_row
  end

  it 'creates sheet row data' do
    expect { subject }.to change { SheetRowDatum.count }.by(1)
  end

  it 'updates sheet row data' do
    create(
      :sheet_row_datum, sheet_row: sheet_row, sheet_column: sheet_column, value: 'Jane'
    )
    subject
    expect(sheet_row.sheet_row_data.find_by(sheet_column: sheet_column).value).to eq('John')
  end

  it 'doesnt update sheet row data if key doesnt exists in datasheet' do
    create(
      :sheet_row_datum, sheet_row: sheet_row, sheet_column: sheet_column, value: 'Jane'
    )
    data.delete('Name')
    data['Age'] = '25'
    subject
    expect(sheet_row.sheet_row_data.find_by(sheet_column: sheet_column).value).to eq('Jane')
  end
end
