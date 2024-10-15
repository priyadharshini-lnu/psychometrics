# frozen_string_literal: true

require 'rails_helper'

describe Sheets::UpdateColumnPositions do
  let(:sheet) { create(:sheet, columns: []) }
  let!(:column1) { create(:sheet_column, sheet: sheet) }
  let!(:column2) { create(:sheet_column, sheet: sheet) }
  let!(:column3) { create(:sheet_column, sheet: sheet) }

  it 'should update positions' do
    expect(sheet.sheet_columns.order(:position)).to eq([column1, column2, column3])

    described_class.call!(sheet, [column2, column1, column3])
    expect(sheet.sheet_columns.order(:position)).to eq([column2, column1, column3])
  end
end
