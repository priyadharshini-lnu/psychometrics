# frozen_string_literal: true

require 'rails_helper'

describe Campaign, type: :model do
  let(:campaign) { create(:campaign) }
  let(:project) { campaign.project }

  describe '#datasheet_columns' do
    it 'returns campaign datasheet columns if there is not project datasheet' do
      create(:datasheet, campaign: campaign, columns: { 'Name' => 'String' })

      expect(campaign.datasheet_columns).to eq({ 'Name' => 'String' })
    end

    it 'return project datsheet columns if there is no campaign datasheet' do
      create(:datasheet, project: project, columns: { 'Name' => 'String' })

      expect(campaign.datasheet_columns).to eq({ 'Name' => 'String' })
    end

    it 'returns combined datasheet columns' do
      create(:datasheet, campaign: campaign, columns: { 'Title' => 'Text' })
      create(:datasheet, project: project, columns: { 'Name' => 'String' })

      expect(campaign.datasheet_columns).to eq({ 'Title' => 'Text', 'Name' => 'String' })
    end
  end

  describe '#datasheet_column_names' do
    it 'return keys for datasheet_columns' do
      allow(campaign).to receive(:datasheet_columns).and_return({ 'Name' => 'String', 'Title' => 'Text' })

      expect(campaign.datasheet_column_names).to eq(%w[Name Title])
    end
  end

  describe '#datasheet_data' do
    let(:campaign_datasheet) { create(:datasheet, campaign: campaign, columns: { 'Name' => 'String' }) }
    let(:project_datasheet) { create(:datasheet, project: project, columns: { 'Name' => 'String' }) }

    it 'returns campaign datasheet columns if there is not project datasheet' do
      create(:datasheet_row, email: 'james@cc.com', datasheet: campaign_datasheet, data: { 'Name' => 'James' })
      create(:datasheet_row, email: 'smith@cc.com', datasheet: campaign_datasheet, data: { 'Name' => 'Smith' })

      expect(campaign.datasheet_data('james@cc.com')).to eq({ 'Name' => 'James' })
    end

    it 'return project datsheet columns if there is no campaign datasheet' do
      create(:datasheet_row, email: 'james@cc.com', datasheet: project_datasheet, data: { 'Name' => 'James' })

      expect(campaign.datasheet_data('james@cc.com')).to eq({ 'Name' => 'James' })
    end

    it 'returns combined datasheet columns' do
      create(:datasheet_row, email: 'james@cc.com', datasheet: project_datasheet,
        data: { 'Name' => 'James', 'Id' => 1 })
      create(:datasheet_row, email: 'james@cc.com', datasheet: campaign_datasheet,
        data: { 'Name' => 'Smith', 'Title' => 'Developer' })

      expect(campaign.datasheet_data('james@cc.com')).to eq({ 'Name' => 'Smith', 'Id' => 1, 'Title' => 'Developer' })
    end
  end

  describe '#nomalized_datasheet_columns' do
    it 'converts columns hash to array' do
      allow(campaign).to receive(:datasheet_columns).and_return({ 'Name' => 'String', 'Title' => 'Text' })

      expect(campaign.nomalized_datasheet_columns).to eq(
        [{ name: 'Name', type: 'String' }, { name: 'Title', type: 'Text' }]
      )
    end
  end
end
