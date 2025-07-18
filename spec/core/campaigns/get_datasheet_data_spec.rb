# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::GetDatasheetData do
  let(:campaign) { create(:campaign) }
  let(:project) { campaign.project }
  let(:campaign_datasheet) { create(:datasheet, campaign: campaign) }
  let(:project_datasheet) { create(:datasheet, project: project) }
  let!(:campaign_columns) do
    [
      create(:sheet_column, sheet: campaign_datasheet, name: 'Name', column_type: 'string'),
      create(:sheet_column, sheet: project_datasheet, name: 'Title', column_type: 'string')
    ]
  end
  let!(:project_columns) do
    [
      create(:sheet_column, sheet: project_datasheet, name: 'Name', column_type: 'string'),
      create(:sheet_column, sheet: project_datasheet, name: 'Id', column_type: 'number')
    ]
  end

  it 'returns campaign datasheet data if there is not project datasheet' do
    r1 = create(:sheet_row, email: 'james@cc.com', sheet: campaign_datasheet)
    r2 = create(:sheet_row, email: 'smith@cc.com', sheet: campaign_datasheet)
    create(:sheet_row_datum, sheet_row: r1, sheet_column: campaign_columns[0], string_value: 'James')
    create(:sheet_row_datum, sheet_row: r2, sheet_column: campaign_columns[0], string_value: 'Smith')

    result = described_class.call!(campaign, %w[james@cc.com smith@cc.com])

    expect(result).to eq({
      'james@cc.com' => { 'Name' => 'James' },
      'smith@cc.com' => { 'Name' => 'Smith' }
    })
  end

  it 'return project datsheet data if there is no campaign datasheet' do
    r1 = create(:sheet_row, email: 'james@cc.com', sheet: project_datasheet)
    create(:sheet_row_datum, sheet_row: r1, sheet_column: project_columns[0], string_value: 'James')

    result = described_class.call!(campaign, 'james@cc.com')

    expect(result).to eq({ 'james@cc.com' => { 'Name' => 'James' } })
  end

  it 'returns combined datasheet columns' do
    r1 = create(:sheet_row, email: 'james@cc.com', sheet: project_datasheet)
    r2 = create(:sheet_row, email: 'james@cc.com', sheet: campaign_datasheet)

    create(:sheet_row_datum, sheet_row: r1, sheet_column: project_columns[0], string_value: 'James')
    create(:sheet_row_datum, sheet_row: r1, sheet_column: project_columns[1], numeric_value: 1)
    create(:sheet_row_datum, sheet_row: r2, sheet_column: campaign_columns[0], string_value: 'Smith')
    create(:sheet_row_datum, sheet_row: r2, sheet_column: campaign_columns[1], string_value: 'Developer')

    result = described_class.call!(campaign, 'james@cc.com')

    expect(result).to eq({ 'james@cc.com' => { 'Name' => 'Smith', 'Id' => 1, 'Title' => 'Developer' } })
  end
end
