# frozen_string_literal: true

require 'rails_helper'

describe Sheets::CreateFlatSheetView do
  let(:campaign) { create(:campaign) }

  describe 'create view for datasheet' do
    let(:datasheet) do
      create(:datasheet, campaign: campaign, columns: [
        { name: 'Email', type: 'String', dashboard_use: true },
        { name: '1st.Name', type: 'String', dashboard_use: true },
        { name: 'EmployeeId', type: 'Number', dashboard_use: true },
        { name: 'Profile', type: 'HTML', dashboard_use: true },
        { name: 'Experience', type: 'Number', dashboard_use: false },
        { name: 'E' * 65, type: 'String', dashboard_use: true }
      ])
    end
    let!(:columns) do
      create(:sheet_column, sheet: datasheet, name: 'Email', column_type: 'string', dashboard_use: true)
      create(:sheet_column, sheet: datasheet, name: '1st.Name', column_type: 'string', dashboard_use: true)
      create(:sheet_column, sheet: datasheet, name: 'EmployeeId', column_type: 'number', dashboard_use: true)
      create(:sheet_column, sheet: datasheet, name: 'Profile', column_type: 'html', dashboard_use: true)
      create(:sheet_column, sheet: datasheet, name: 'Experience', column_type: 'number', dashboard_use: false)
      create(:sheet_column, sheet: datasheet, name: 'E' * 65, column_type: 'string', dashboard_use: true)
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
        self.table_name = "c_#{campaign_id}.datasheet"
      end
      # rubocop:enable Lint/ConstantDefinitionInBlock
      expect(DatasheetFlat.column_names).to match_array(%w[id Email 1st.Name EmployeeId Profile])
      [sheet_row1, sheet_row2].each do |row|
        sheet_row_flat = DatasheetFlat.find_by(Email: row.email)
        expect(sheet_row_flat['1st.Name']).to eq(row.data['1st.Name'])
        expect(sheet_row_flat.EmployeeId).to eq(row.data['EmployeeId'])
        expect(sheet_row_flat.Profile).to eq(row.data['Profile'])
        expect(sheet_row_flat.respond_to?('E' * 65)).to eq(false)
        expect(sheet_row_flat.respond_to?('E' * 64)).to eq(false)
      end
    end

    it "doesn't creates flat view for datasheet is sha of flat view schema has not changed" do
      described_class.call!(datasheet)

      expect(ActiveRecord::Base.connection).to_not receive(:execute)
      described_class.call!(datasheet)
    end
  end

  describe 'create view for accesssheet' do
    let(:accesssheet) do
      create(:accesssheet, campaign: campaign, columns: [
        { name: 'Email', type: 'String' },
        { name: '1st.Name', type: 'String' },
        { name: 'EmployeeId', type: 'Number' }
      ])
    end
    let!(:columns) do
      create(:sheet_column, sheet: accesssheet, name: 'Email', column_type: 'string')
      create(:sheet_column, sheet: accesssheet, name: '1st.Name', column_type: 'string')
      create(:sheet_column, sheet: accesssheet, name: 'EmployeeId', column_type: 'number')
    end
    let!(:sheet_row1) do
      create(:sheet_row, sheet: accesssheet, email: 'james@cc.com',
              data: { '1st.Name' => 'James', 'EmployeeId' => 1 })
    end
    let!(:sheet_row2) do
      create(:sheet_row, sheet: accesssheet, email: 'andrew@cc.com',
        data: { '1st.Name' => 'Andrew', 'EmployeeId' => 1 })
    end

    it 'creates flat view for accesssheet' do
      described_class.call!(accesssheet)
      # rubocop:disable Lint/ConstantDefinitionInBlock
      campaign_id = campaign.id
      AccesssheetFlat = Class.new(ApplicationRecord) do
        self.table_name = "c_#{campaign_id}.accesssheet"
      end
      # rubocop:enable Lint/ConstantDefinitionInBlock
      expect(AccesssheetFlat.column_names).to match_array(%w[id Email 1st.Name EmployeeId])

      [sheet_row1, sheet_row2].each do |row|
        sheet_row_flat = AccesssheetFlat.find_by(Email: row.email)
        expect(sheet_row_flat['1st.Name']).to eq(row.data['1st.Name'])
        expect(sheet_row_flat.EmployeeId).to eq(row.data['EmployeeId'])
      end
    end

    it "doesn't creates flat view for datasheet is sha of flat view schema has not changed" do
      described_class.call!(accesssheet)

      expect(ActiveRecord::Base.connection).to_not receive(:execute)
      described_class.call!(accesssheet)
    end
  end
end
