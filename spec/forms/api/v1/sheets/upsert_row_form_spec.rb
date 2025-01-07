# frozen_string_literal: true

require 'rails_helper'

describe Api::V1::Sheets::UpsertRowForm do
  let(:data) { { 'Name' => 'John' } }
  let(:campaign) { create(:campaign) }
  let(:project) { create(:project) }
  let!(:sheet) { create(:sheet, campaign: campaign, type: 'Datasheet') }
  let!(:sheet_row) { create(:sheet_row, sheet: sheet) }
  let!(:sheet_column) { create(:sheet_column, sheet: sheet, name: 'Current Position') }
  let!(:sheet_column_number) { create(:sheet_column, sheet: sheet, name: 'Hope', column_type: 'number') }
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
    expect(form.errors[:data]).to include(
      I18n.t('datasheet.errors.datasheet_column.not_found', column_name: 'Age')
    )
  end

  context 'validates data type' do
    it 'validates string column with string data' do
      data['Current Position'] = 'John'
      form = described_class.new({ data: data }).with_context(sheet: sheet)

      expect(form.valid?).to eq(true)
    end

    it 'validates string column for number data' do
      data['Current Position'] = 25

      form = described_class.new({ data: data }).with_context(sheet: sheet)

      expect(form.valid?).to eq(false)
      expect(form.errors[:data]).to include(
        I18n.t('datasheet.errors.datasheet_column.string_value_required', field: 'Current Position')
      )
    end

    it 'validates number column for string data' do
      data['Hope'] = 'John'

      form = described_class.new({ data: data }).with_context(sheet: sheet)

      expect(form.valid?).to eq(false)
      expect(form.errors[:data]).to include(
        I18n.t('datasheet.errors.datasheet_column.numeric_value_required', field: 'Hope')
      )
    end

    it 'validates number column with numeric data' do
      data['Hope'] = 10
      form = described_class.new({ data: data }).with_context(sheet: sheet)

      expect(form.valid?).to eq(true)
    end
  end
end
