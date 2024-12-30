# frozen_string_literal: true

require 'rails_helper'

describe Campaign, type: :model do
  let(:campaign) { create(:campaign) }
  let(:project) { campaign.project }

  describe '#datasheet_columns' do
    it 'returns campaign datasheet columns if there is not project datasheet' do
      datasheet = create(:datasheet, campaign: campaign, columns: [{ name: 'Name', type: 'String' }])
      create(:sheet_column, name: 'Name', column_type: 'string', sheet: datasheet)

      expect(campaign.datasheet_columns).to eq([{ 'name' => 'Name', 'type' => 'String' }])
    end

    it 'return project datsheet columns if there is no campaign datasheet' do
      datasheet = create(:datasheet, project: project, columns: [{ name: 'Name', type: 'String' }])
      create(:sheet_column, name: 'Name', column_type: 'string', sheet: datasheet)

      expect(campaign.datasheet_columns).to eq([{ 'name' => 'Name', 'type' => 'String' }])
    end

    it 'returns combined datasheet columns' do
      c_datasheet = create(:datasheet, campaign: campaign, columns: [{ name: 'Title', type: 'Text' }])
      p_datasheet = create(:datasheet, project: project, columns: [{ name: 'Name', type: 'String' }])
      create(:sheet_column, name: 'Title', column_type: 'text', sheet: c_datasheet)
      create(:sheet_column, name: 'Name', column_type: 'string', sheet: p_datasheet)

      expect(campaign.datasheet_columns).to eq([{ 'name' => 'Name', 'type' => 'String' },
                                                { 'name' => 'Title', 'type' => 'Text' }])
    end

    it 'returns combined datasheet columns with different types' do
      c_datasheet = create(:datasheet, campaign: campaign, columns: [{ name: 'Name', type: 'Text' }])
      p_datasheet = create(:datasheet, project: project, columns: [{ name: 'Name', type: 'String' }])
      create(:sheet_column, name: 'Name', column_type: 'text', sheet: c_datasheet)
      create(:sheet_column, name: 'Name', column_type: 'string', sheet: p_datasheet)

      expect(campaign.datasheet_columns).to eq([{ 'name' => 'Name', 'type' => 'Text' }])
    end
  end

  describe '#datasheet_column_names' do
    it 'return keys for datasheet_columns' do
      allow(campaign).to receive(:datasheet_columns).and_return([{ 'name' => 'Name', 'type' => 'String' },
                                                                 { 'name' => 'Title', 'type' => 'Text' }])

      expect(campaign.datasheet_column_names).to eq(%w[Name Title])
    end
  end

  describe '#datasheet_data' do
    let(:campaign_datasheet) { create(:datasheet, campaign: campaign, columns: [{ name: 'Name', type: 'String' }]) }
    let(:project_datasheet) { create(:datasheet, project: project, columns: [{ name: 'Name', type: 'String' }]) }

    it 'returns campaign datasheet columns if there is not project datasheet' do
      col = create(:sheet_column, name: 'Name', column_type: 'string', sheet: campaign_datasheet)
      r1 = create(:sheet_row, email: 'james@cc.com', sheet: campaign_datasheet)
      r2 = create(:sheet_row, email: 'smith@cc.com', sheet: campaign_datasheet)
      create(:sheet_row_datum, sheet_row: r1, sheet_column: col, value: 'James')
      create(:sheet_row_datum, sheet_row: r2, sheet_column: col, value: 'Smith')
      expect(campaign.datasheet_data('james@cc.com')).to eq({ 'Name' => 'James' })
    end

    it 'return project datsheet columns if there is no campaign datasheet' do
      col = create(:sheet_column, name: 'Name', column_type: 'string', sheet: campaign_datasheet)
      r1 = create(:sheet_row, email: 'james@cc.com', sheet: project_datasheet)
      create(:sheet_row_datum, sheet_row: r1, sheet_column: col, value: 'James')

      expect(campaign.datasheet_data('james@cc.com')).to eq({ 'Name' => 'James' })
    end

    it 'returns combined datasheet columns' do
      col_name1 = create(:sheet_column, name: 'Name', column_type: 'string', sheet: project_datasheet)
      col_name2 = create(:sheet_column, name: 'Name', column_type: 'string', sheet: campaign_datasheet)
      col_id = create(:sheet_column, sheet: project_datasheet, name: 'Id', column_type: 'number')
      col_title = create(:sheet_column, sheet: campaign_datasheet, name: 'Title', column_type: 'string')

      r1 = create(:sheet_row, email: 'james@cc.com', sheet: project_datasheet)
      r2 = create(:sheet_row, email: 'james@cc.com', sheet: campaign_datasheet)

      create(:sheet_row_datum, sheet_row: r1, sheet_column: col_name1, string_value: 'James')
      create(:sheet_row_datum, sheet_row: r1, sheet_column: col_id, numeric_value: 1)

      create(:sheet_row_datum, sheet_row: r2, sheet_column: col_name2, string_value: 'Smith')
      create(:sheet_row_datum, sheet_row: r2, sheet_column: col_title, string_value: 'Developer')

      expect(campaign.datasheet_data('james@cc.com')).to eq({ 'Name' => 'Smith', 'Id' => 1, 'Title' => 'Developer' })
    end
  end
end
