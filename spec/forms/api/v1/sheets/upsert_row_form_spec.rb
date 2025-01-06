# frozen_string_literal: true

require 'rails_helper'

describe Api::V1::Sheets::UpsertRowForm do
  let(:data) { { 'Name' => 'John' } }
  let(:campaign) { create(:campaign) }
  let(:project) { create(:project) }
  let!(:sheet) { create(:sheet, campaign: campaign, type: 'Datasheet') }
  let!(:sheet_row) { create(:sheet_row, sheet: sheet) }
  let!(:sheet_column) { create(:sheet_column, sheet: sheet, name: 'Current Position') }
  let(:data) do
    {
      'Current Position' => 'John'
    }
  end

  it 'validates column exists' do
    form = described_class.new({ data: data }).with_context(sheet: sheet)

    expect(form.valid?).to eq(true)
  end

  it 'validates column does not exists' do
    data['Age'] = 25
    form = described_class.new({ data: data }).with_context(sheet: sheet)

    expect(form.valid?).to eq(false)
    expect(form.errors[:data]).to include("Column 'Age' not found")
  end

  it 'validates data type' do
    data['Current Position'] = 25
    form = described_class.new({ data: data }).with_context(sheet: sheet)

    expect(form.valid?).to eq(false)
    expect(form.errors[:data]).to include("Column 'Current Position' should be a string")
  end
end
