# frozen_string_literal: true

require 'rails_helper'

describe SheetRow, type: :model do
  it { should belong_to(:sheet).inverse_of(:rows) }

  describe '#sync_data' do
    let!(:sheet) { create(:sheet) }
    let!(:sheet_column) { create(:sheet_column, sheet: sheet) }
    let!(:sheet_row) { create(:sheet_row, sheet: sheet, data: {}) }

    context 'when the column is a number' do
      it 'creates a new row data with numeric value' do
        sheet_column.update(column_type: 'number')
        sheet.reload
        sheet_row.data = { sheet_column.name => 1.5 }
        sheet_row.save!

        expect(sheet_row.sheet_row_data.first.numeric_value).to eq(1.5)
      end
    end

    context 'when the column is a string' do
      it 'creates a new row data with string value' do
        sheet_column.update(column_type: 'string')
        sheet.reload
        sheet_row.data = { sheet_column.name => 'MyText' }
        sheet_row.save!

        expect(sheet_row.sheet_row_data.first.string_value).to eq('MyText')
      end
    end
  end
end
