# frozen_string_literal: true

require 'rails_helper'

describe Sheets::CreateFlatSheetView do
  let(:campaign) { create(:campaign) }
  let(:datasheet) do
    create(:datasheet, campaign: campaign, columns: [
      { name: 'Email', type: 'String', dashboard_use: true },
      { name: '1st.Name', type: 'String', dashboard_use: true },
      { name: 'EmployeeId', type: 'Number', dashboard_use: true },
      { name: 'Profile', type: 'HTML', dashboard_use: true },
      { name: 'Experience', type: 'Number', dashboard_use: false }
    ])
  end
  let!(:sheet_row1) do
    create(:sheet_row, sheet: datasheet, email: 'james@cc.com',
            data: { '1st.Name' => 'James', 'EmployeeId' => 1, 'Profile' => 'ROR' })
  end
  let!(:sheet_row2) do
    create(:sheet_row, sheet: datasheet, email: 'andrew@cc.com',
      data: { '1st.Name' => 'Andrew', 'EmployeeId' => 1 })
  end

  it 'creates flat view for datasheet' do
    described_class.call!(datasheet)
    campaign_id = campaign.id
    # rubocop:disable Lint/ConstantDefinitionInBlock
    DatasheetFlat = Class.new(ApplicationRecord) do
      self.table_name = "c_#{campaign_id}_datasheet"
    end
    expect(DatasheetFlat.column_names).to match_array(%w[id Email 1st.Name EmployeeId Profile])
    [sheet_row1, sheet_row2].each do |row|
      sheet_row_flat = DatasheetFlat.find_by(Email: row.email)
      expect(sheet_row_flat['1st.Name']).to eq(row.data['1st.Name'])
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
    # rubocop:enable all
    expect(DatasheetFlat.column_names).to match_array(%w[id Email 1st.Name EmployeeId Profile])

    [sheet_row1, sheet_row2].each do |row|
      sheet_row_flat = AccesssheetFlat.find_by(Email: row.email)
      expect(sheet_row_flat['1st.Name']).to eq(row.data['1st.Name'])
      expect(sheet_row_flat.EmployeeId).to eq(row.data['EmployeeId'])
      expect(sheet_row_flat.Profile).to eq(row.data['Profile'])
    end
  end

  it "doesn't creates flat view for datasheet is sha of flat view schema has not changed" do
    described_class.call!(datasheet)

    expect(ActiveRecord::Base.connection).to_not receive(:execute)
    described_class.call!(datasheet)
  end
end
