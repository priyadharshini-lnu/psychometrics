# frozen_string_literal: true

require 'rails_helper'

describe DatasheetRowQuery do
  let!(:campaign) { create(:campaign) }
  let!(:sheet) do
    create(:sheet, campaign: campaign)
  end
  let!(:columns) do
    [
      create(:sheet_column, sheet: sheet, name: 'First', column_type: 'string'),
      create(:sheet_column, sheet: sheet, name: 'Second', column_type: 'number')
    ]
  end
  let!(:sheet_rows) { create(:sheet_row, sheet: sheet, email: 'test@email.com') }

  let!(:sheet_row_data) do
    create(:sheet_row_datum, sheet_row: sheet_rows, sheet_column: columns[0], string_value: 'test')
    create(:sheet_row_datum, sheet_row: sheet_rows, sheet_column: columns[1], numeric_value: 3.5)
  end

  it 'should return the data for the sheet rows with all columns' do
    result = described_class.new(campaign_ids: [campaign.id], limit: 10, offset: 0).query

    expect(result.first).to eq({
      'Campaign ID' => campaign.id,
      'Campaign Name' => campaign.name,
      'Email' => 'test@email.com',
      'ID' => sheet_rows.id,
      'Project ID' => campaign.project_id,
      'Project Name' => campaign.project.name,
      'First' => 'test',
      'Second' => '3.5'
    })
  end
end
