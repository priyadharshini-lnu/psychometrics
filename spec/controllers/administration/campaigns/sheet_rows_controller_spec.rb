# frozen_string_literal: true

require 'rails_helper'
RSpec.describe Administration::Campaigns::SheetRowsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let(:sheet) do
    create(:sheet, campaign: campaign, columns: [
      { name: 'Email', type: 'String', accessor_access: true, dashboard_use: true, visible_in_list: true },
      { name: 'Name', type: 'String', accessor_access: true, dashboard_use: true, visible_in_list: true },
      { name: 'Profile', type: 'Markdown', accessor_access: true, dashboard_use: true, visible_in_list: true },
      { name: 'Description', type: 'HTML', accessor_access: true, dashboard_use: true, visible_in_list: true }
    ])
  end
  let!(:columns) do
    sheet.sheet_columns << create(:sheet_column, sheet: sheet, name: 'Email', column_type: 'string',
                                  accessor_access: true, dashboard_use: true, visible_in_list: true)
    sheet.sheet_columns << create(:sheet_column, sheet: sheet, name: 'Name', column_type: 'string',
                                  accessor_access: true, dashboard_use: true, visible_in_list: true)
    sheet.sheet_columns << create(:sheet_column, sheet: sheet, name: 'Profile', column_type: 'markdown',
                                  accessor_access: true, dashboard_use: true, visible_in_list: true)
    sheet.sheet_columns << create(:sheet_column, sheet: sheet, name: 'Description', column_type: 'html',
                                  accessor_access: true, dashboard_use: true, visible_in_list: true)
  end
  let!(:sheet_row) do
    create(:sheet_row, sheet: sheet, email: 'james@cc.com')
  end
  let!(:sheet_row_data) do
    sheet_row.add_sheet_row_data({
      'Name' => 'James', 'Profile' => 'Software Engineer', 'Description' => 'J1'
    })
  end

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  describe 'GET index' do
    it 'renders sheet_row json without HTML and Markdown type on json request' do
      sheet_row2 = create(:sheet_row, sheet: sheet, email: 'smith@cc.com')
      sheet_row2.add_sheet_row_data({
        'Name' => 'Smith', 'Profile' => 'Carpenter', 'Description' => 'S1'
      })

      get :index, params: { new_campaign_id: campaign.id, type: 'Datasheet' }, format: :json
      parsed_response = JSON.parse(response.body)

      expect(parsed_response['columns']).to match_array(
        [
          { 'id' => 1, 'name' => 'Email', 'column_type' => 'string', 'accessor_access' => true,
            'dashboard_use' => true, 'visible_in_list' => true, 'position' => 0 },
          { 'id' => 2, 'name' => 'Name', 'column_type' => 'string', 'accessor_access' => true,
            'dashboard_use' => true, 'visible_in_list' => true, 'position' => 1  },
          { 'id' => 3, 'name' => 'Profile', 'column_type' => 'markdown', 'accessor_access' => true,
            'dashboard_use' => true, 'visible_in_list' => true, 'position' => 2  },
          { 'id' => 4, 'name' => 'Description', 'column_type' => 'html', 'accessor_access' => true,
            'dashboard_use' => true, 'visible_in_list' => true, 'position' => 3  }
        ]
      )
      expect(parsed_response['total']).to eq(2)
      expect(parsed_response['list'][0]).to eq({
        'id' => sheet_row.id, 'Email' => 'james@cc.com', 'Name' => 'James'
      })
      expect(parsed_response['list'][1]).to eq({
        'id' => sheet_row2.id, 'Email' => 'smith@cc.com', 'Name' => 'Smith'
      })
    end
  end

  describe 'GET show' do
    it 'returns campaign and project data_sheet record with all types' do
      project_sheet = create(:sheet, project: campaign.project,
      columns: [
        { name: 'Email', type: 'String', accessor_access: true, dashboard_use: true, visible_in_list: true },
        { name: 'Name', type: 'String', accessor_access: true, dashboard_use: true, visible_in_list: true }
      ])
      project_sheet.sheet_columns << create(:sheet_column, sheet: sheet, name: 'Email', column_type: 'string',
                                    accessor_access: true, dashboard_use: true, visible_in_list: true)
      project_sheet.sheet_columns << create(:sheet_column, sheet: sheet, name: 'Name', column_type: 'string',
                                    accessor_access: true, dashboard_use: true, visible_in_list: true)

      project_sheet_row = create(:sheet_row, sheet: project_sheet, email: sheet_row.email)

      project_sheet_row.add_sheet_row_data({
        'Name' => 'James S'
      })

      get :show, params: { id: sheet_row.id, new_campaign_id: campaign.id, type: 'Datasheet' }, format: :json
      parsed_response = JSON.parse(response.body)
      # Campaign sheet record assertions

      expect(parsed_response[0]['type']).to eq('new_campaign')
      expect(parsed_response[0]['columns']).to match_array(
        [
          { 'id' => 5, 'name' => 'Email', 'column_type' => 'string', 'accessor_access' => true,
            'dashboard_use' => true, 'visible_in_list' => true, 'position' => 0 },
          { 'id' => 6, 'name' => 'Name', 'column_type' => 'string', 'accessor_access' => true,
            'dashboard_use' => true, 'visible_in_list' => true, 'position' => 1  },
          { 'id' => 7, 'name' => 'Profile', 'column_type' => 'markdown', 'accessor_access' => true,
            'dashboard_use' => true, 'visible_in_list' => true, 'position' => 2  },
          { 'id' => 8, 'name' => 'Description', 'column_type' => 'html', 'accessor_access' => true,
            'dashboard_use' => true, 'visible_in_list' => true, 'position' => 3  }
        ]
      )
      expect(parsed_response[0]['record']).to eq({
        'id' => sheet_row.id, 'Email' => 'james@cc.com', 'Name' => 'James', 'Profile' => 'Software Engineer',
        'Description' => 'J1'
      })

      # Project sheet record assertions
      expect(parsed_response[1]['type']).to eq('project')
      expect(parsed_response[1]['columns']).to match_array(
        [
          { 'id' => 9, 'name' => 'Email', 'column_type' => 'string', 'accessor_access' => true,
            'dashboard_use' => true, 'visible_in_list' => true, 'position' => 0 },
          { 'id' => 10, 'name' => 'Name', 'column_type' => 'string', 'accessor_access' => true,
            'dashboard_use' => true, 'visible_in_list' => true, 'position' => 1 }
        ]
      )
      expect(parsed_response[1]['record']).to eq({
        'id' => project_sheet_row.id, 'Email' => 'james@cc.com', 'Name' => 'James S'
      })
    end
  end

  describe 'POST create' do
    it 'creates sheet_row with only columns defined in sheet' do
      get :create, params: {
        new_campaign_id: campaign.id, 'Email' => 'mark@cc.com', 'Name' => 'Mark', 'Company' => 'Abctech',
        type: 'Datasheet'
      }, format: :json

      sheet_row = sheet.rows.find_by(email: 'mark@cc.com')

      parsed_response = JSON.parse(response.body)
      expect(parsed_response).to eq({
        'id' => sheet_row.id, 'Email' => 'mark@cc.com', 'Name' => 'Mark'
      })
      expect(sheet_row.sheet_row_data.last.string_value).to eq('Mark')
    end

    it 'renders error if email is invalid' do
      get :create, params: {
        new_campaign_id: campaign.id, 'Name' => 'Mark', 'Company' => 'Abctech',
        type: 'Datasheet'
      }, format: :json

      parsed_response = JSON.parse(response.body)
      expect(parsed_response).to eq({ 'errors' => { 'email' => ["Email can't be blank"] } })
    end
  end

  describe 'PUT update' do
    it 'updates sheet_row with only columns defined in sheet' do
      get :update, params: {
        new_campaign_id: campaign.id, id: sheet_row.id, 'Name' => 'James Smith', 'Company' => 'Abctech',
        type: 'Datasheet'
      }, format: :json

      parsed_response = JSON.parse(response.body)
      expect(parsed_response).to eq({
        'id' => sheet_row.id, 'Email' => 'james@cc.com', 'Name' => 'James Smith',
        'Description' => 'J1', 'Profile' => 'Software Engineer'
      })
      expect(sheet_row.sheet_row_data.first.string_value).to eq('James Smith')
    end
  end

  describe 'DELETE bulk_delete' do
    it 'bulk deletes sheet_row' do
      sheet_row2 = create(:sheet_row, sheet: sheet, email: 'smith@cc.com')

      delete :bulk_delete,
             params: { new_campaign_id: campaign.id, ids: [sheet_row.id, sheet_row2.id], type: 'Datasheet' },
             format: :json

      expect(SheetRow.find_by(id: sheet_row.id)).to eq(nil)
      expect(SheetRow.find_by(id: sheet_row2.id)).to eq(nil)
      expect(SheetRowDatum.find_by(sheet_row_id: sheet_row.id)).to eq(nil)
    end
  end

  describe 'PUT import' do
    it 'sends errors if imported xlsx is not valid' do
      file = Rack::Test::UploadedFile.new(
        Rails.root.join('spec/fixtures/files/sheet/invalid_file.xlsx'), 'application/xlsx'
      )
      put :import, params: {
        new_campaign_id: campaign.id,
        file: file,
        type: 'Datasheet'
      }
      parsed_response = JSON.parse(response.body)

      expect(parsed_response['errors']).to include('File does not contain Email column')
      expect(parsed_response['errors']).to include(
        'Column <b>Profile</b> is expected to be of type Markdown but got <b>Text</b>'
      )
    end

    it 'create AdminJobRecord for import_sheet job if file is valid' do
      file = Rack::Test::UploadedFile.new(
        Rails.root.join('spec/fixtures/files/sheet/valid_file.xlsx'), 'application/xlsx'
      )
      put :import, params: {
        new_campaign_id: campaign.id,

        file: file,
        type: 'Datasheet'
      }

      expect(AdminJobRecord.exists?(operation: 'import_datasheet')).to be_truthy
    end
  end

  describe 'GET export' do
    it 'sends xlsx file' do
      data = 'data'
      xlsx = double
      allow(xlsx).to receive_message_chain(:to_stream, :read) { data }
      expect(::Sheets::Export).to receive(:call!).with(sheet).and_return(xlsx)
      expect(controller).to receive(:send_data).with(data, filename: "sheet-for-#{campaign.name}.xlsx")

      get :export, format: 'xlsx', params: { new_campaign_id: campaign.id, type: 'Datasheet' }
    end
  end
end
