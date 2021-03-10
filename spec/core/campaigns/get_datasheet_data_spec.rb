# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::GetDatasheetData do
  let(:campaign) { create(:campaign) }
  let(:project) { campaign.project }
  let(:campaign_datasheet) { create(:datasheet, campaign: campaign, columns: { 'Name' => 'String' }) }
  let(:project_datasheet) { create(:datasheet, project: project, columns: { 'Name' => 'String' }) }

  it 'returns campaign datasheet data if there is not project datasheet' do
    create(:datasheet_row, email: 'james@cc.com', datasheet: campaign_datasheet, data: { 'Name' => 'James' })
    create(:datasheet_row, email: 'smith@cc.com', datasheet: campaign_datasheet, data: { 'Name' => 'Smith' })

    result = described_class.call!(campaign, %w[james@cc.com smith@cc.com])

    expect(result).to eq({
      'james@cc.com' => { 'Name' => 'James' },
      'smith@cc.com' => { 'Name' => 'Smith' }
    })
  end

  it 'return project datsheet data if there is no campaign datasheet' do
    create(:datasheet_row, email: 'james@cc.com', datasheet: project_datasheet, data: { 'Name' => 'James' })

    result = described_class.call!(campaign, 'james@cc.com')

    expect(result).to eq({ 'james@cc.com' => { 'Name' => 'James' } })
  end

  it 'returns combined datasheet columns' do
    create(:datasheet_row, email: 'james@cc.com', datasheet: project_datasheet,
      data: { 'Name' => 'James', 'Id' => 1 })
    create(:datasheet_row, email: 'james@cc.com', datasheet: campaign_datasheet,
      data: { 'Name' => 'Smith', 'Title' => 'Developer' })

    result = described_class.call!(campaign, 'james@cc.com')

    expect(result).to eq({ 'james@cc.com' => { 'Name' => 'Smith', 'Id' => 1, 'Title' => 'Developer' } })
  end
end
