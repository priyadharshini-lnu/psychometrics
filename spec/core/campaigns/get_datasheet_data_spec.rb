# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::GetDatasheetData do
  let(:campaign) { create(:campaign) }
  let(:project) { campaign.project }
  let(:campaign_datasheet) { create(:datasheet, campaign: campaign, columns: [{ name: 'Name', type: 'String' }]) }
  let(:project_datasheet) { create(:datasheet, project: project, columns: [{ name: 'Name', type: 'String' }]) }

  it 'returns campaign datasheet data if there is not project datasheet' do
    create(:sheet_row, email: 'james@cc.com', sheet: campaign_datasheet, data: { 'Name' => 'James' })
    create(:sheet_row, email: 'smith@cc.com', sheet: campaign_datasheet, data: { 'Name' => 'Smith' })

    result = described_class.call!(campaign, %w[james@cc.com smith@cc.com])

    expect(result).to eq({
      'james@cc.com' => { 'Name' => 'James' },
      'smith@cc.com' => { 'Name' => 'Smith' }
    })
  end

  it 'return project datsheet data if there is no campaign datasheet' do
    create(:sheet_row, email: 'james@cc.com', sheet: project_datasheet, data: { 'Name' => 'James' })

    result = described_class.call!(campaign, 'james@cc.com')

    expect(result).to eq({ 'james@cc.com' => { 'Name' => 'James' } })
  end

  it 'returns combined datasheet columns' do
    create(:sheet_row, email: 'james@cc.com', sheet: project_datasheet,
      data: { 'Name' => 'James', 'Id' => 1 })
    create(:sheet_row, email: 'james@cc.com', sheet: campaign_datasheet,
      data: { 'Name' => 'Smith', 'Title' => 'Developer' })

    result = described_class.call!(campaign, 'james@cc.com')

    expect(result).to eq({ 'james@cc.com' => { 'Name' => 'Smith', 'Id' => 1, 'Title' => 'Developer' } })
  end
end
