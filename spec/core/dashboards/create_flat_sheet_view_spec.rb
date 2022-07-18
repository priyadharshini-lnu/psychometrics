# frozen_string_literal: true

require 'rails_helper'

describe Dashboards::CreateFlatSheetView do
  let(:campaign) { create(:campaign) }
  let(:datasheet) do
    create(:datasheet, campaign: campaign, columns: [
      { name: 'Email', type: 'String', dashboard_use: true },
      { name: 'Name', type: 'String', dashboard_use: true },
      { name: 'EmployeeId', type: 'Number', dashboard_use: true },
      { name: 'Profile', type: 'HTML', dashboard_use: true },
      { name: 'Experience', type: 'Number', dashboard_use: false }
    ])
  end
  let!(:sheet_row1) do
    create(:sheet_row, sheet: datasheet, email: 'james@cc.com',
            data: { 'Name' => 'James', 'EmployeeId' => 1, 'Profile' => 'ROR' })
  end
  let!(:sheet_row2) do
    create(:sheet_row, sheet: datasheet, email: 'andrew@cc.com',
      data: { 'Name' => 'Andrew', 'EmployeeId' => 1 })
  end

  it 'creates flat view for datasheet' do
    described_class.call!(datasheet)
    campaign_id = campaign.id
    DatasheetFlat = Class.new(ApplicationRecord) do
      self.table_name = "c_#{campaign_id}_datasheet"
    end
    expect(DatasheetFlat.column_names).to match_array(%w[id Email Name EmployeeId Profile])
    [sheet_row1, sheet_row2].each do |row|
      sheet_row_flat = DatasheetFlat.find_by(Email: row.email)
      expect(sheet_row_flat.Name).to eq(row.data['Name'])
      expect(sheet_row_flat.EmployeeId).to eq(row.data['EmployeeId'])
      expect(sheet_row_flat.Profile).to eq(row.data['Profile'])
    end
  end

  it 'creates flat view for accesssheet' do
    datasheet.update(type: 'Accesssheet')
    described_class.call!(datasheet)
    campaign_id = campaign.id
    AccesssheetFlat = Class.new(ApplicationRecord) do
      self.table_name = "c_#{campaign_id}_accesssheet"
    end
    expect(DatasheetFlat.column_names).to match_array(%w[id Email Name EmployeeId Profile])

    [sheet_row1, sheet_row2].each do |row|
      sheet_row_flat = AccesssheetFlat.find_by(Email: row.email)
      expect(sheet_row_flat.Name).to eq(row.data['Name'])
      expect(sheet_row_flat.EmployeeId).to eq(row.data['EmployeeId'])
      expect(sheet_row_flat.Profile).to eq(row.data['Profile'])
    end
  end
end
