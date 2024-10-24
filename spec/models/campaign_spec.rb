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
      create(:sheet_row, email: 'james@cc.com', sheet: campaign_datasheet, data: { 'Name' => 'James' })
      create(:sheet_row, email: 'smith@cc.com', sheet: campaign_datasheet, data: { 'Name' => 'Smith' })

      expect(campaign.datasheet_data('james@cc.com')).to eq({ 'Name' => 'James' })
    end

    it 'return project datsheet columns if there is no campaign datasheet' do
      create(:sheet_row, email: 'james@cc.com', sheet: project_datasheet, data: { 'Name' => 'James' })

      expect(campaign.datasheet_data('james@cc.com')).to eq({ 'Name' => 'James' })
    end

    it 'returns combined datasheet columns' do
      create(:sheet_row, email: 'james@cc.com', sheet: project_datasheet,
        data: { 'Name' => 'James', 'Id' => 1 })
      create(:sheet_row, email: 'james@cc.com', sheet: campaign_datasheet,
        data: { 'Name' => 'Smith', 'Title' => 'Developer' })

      expect(campaign.datasheet_data('james@cc.com')).to eq({ 'Name' => 'Smith', 'Id' => 1, 'Title' => 'Developer' })
    end
  end
end
