# frozen_string_literal: true

require 'rails_helper'
RSpec.describe Administration::Campaigns::DatasheetRowsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let(:datasheet) do
    create(:datasheet, campaign: campaign, columns: [
      { name: 'Email', type: 'String', accessor_access: true, dashboard_use: true, visible_in_list: true },
      { name: 'Name', type: 'String', accessor_access: true, dashboard_use: true, visible_in_list: true },
      { name: 'Profile', type: 'Markdown', accessor_access: true, dashboard_use: true, visible_in_list: true },
      { name: 'Description', type: 'HTML', accessor_access: true, dashboard_use: true, visible_in_list: true }
    ])
  end
  let!(:datasheet_row) do
    create(:datasheet_row, datasheet: datasheet, email: 'james@cc.com',
            data: { 'Name' => 'James', 'Profile' => 'Software Engineer', 'Description' => 'J1' })
  end

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  describe 'GET index' do
    it 'renders datasheet_row json without HTML and Markdown type on json request' do
      datasheet_row2 = create(:datasheet_row, datasheet: datasheet, email: 'smith@cc.com',
            data: { 'Name' => 'Smith', 'Profile' => 'Carpenter', 'Description' => 'S1' })

      get :index, params: { new_campaign_id: campaign.id }, format: :json
      parsed_response = JSON.parse(response.body)

      expect(parsed_response['columns']).to match_array(
        [
          { 'name' => 'Email', 'type' => 'String', 'accessor_access' => true,
            'dashboard_use' => true, 'visible_in_list' => true },
          { 'name' => 'Name', 'type' => 'String', 'accessor_access' => true,
            'dashboard_use' => true, 'visible_in_list' => true },
          { 'name' => 'Profile', 'type' => 'Markdown', 'accessor_access' => true,
            'dashboard_use' => true, 'visible_in_list' => true },
          { 'name' => 'Description', 'type' => 'HTML', 'accessor_access' => true,
            'dashboard_use' => true, 'visible_in_list' => true }
        ]
      )
      expect(parsed_response['total']).to eq(2)
      expect(parsed_response['list'][0]).to eq({
        'id' => datasheet_row.id, 'Email' => 'james@cc.com', 'Name' => 'James'
      })
      expect(parsed_response['list'][1]).to eq({
        'id' => datasheet_row2.id, 'Email' => 'smith@cc.com', 'Name' => 'Smith'
      })
    end
  end

  describe 'GET show' do
    it 'returns campaign and project data_sheet record with all types' do
      project_datasheet = create(:datasheet, project: campaign.project,
      columns: [
        { name: 'Email', type: 'String', accessor_access: true, dashboard_use: true, visible_in_list: true },
        { name: 'Name', type: 'String', accessor_access: true, dashboard_use: true, visible_in_list: true }
      ])
      project_datasheet_row = create(:datasheet_row, datasheet: project_datasheet, email: datasheet_row.email,
        data: { 'Name' => 'James S' })

      get :show, params: { id: datasheet_row.id, new_campaign_id: campaign.id }, format: :json
      parsed_response = JSON.parse(response.body)

      # Campaign datasheet record assertions
      expect(parsed_response[0]['type']).to eq('new_campaign')
      expect(parsed_response[0]['columns']).to match_array(
        [
          { 'name' => 'Email', 'type' => 'String', 'accessor_access' => true,
            'dashboard_use' => true, 'visible_in_list' => true },
          { 'name' => 'Name', 'type' => 'String', 'accessor_access' => true,
            'dashboard_use' => true, 'visible_in_list' => true },
          { 'name' => 'Profile', 'type' => 'Markdown', 'accessor_access' => true,
            'dashboard_use' => true, 'visible_in_list' => true },
          { 'name' => 'Description', 'type' => 'HTML', 'accessor_access' => true,
            'dashboard_use' => true, 'visible_in_list' => true }
        ]
      )
      expect(parsed_response[0]['record']).to eq({
        'id' => datasheet_row.id, 'Email' => 'james@cc.com', 'Name' => 'James', 'Profile' => 'Software Engineer',
        'Description' => 'J1'
      })

      # Project datasheet record assertions
      expect(parsed_response[1]['type']).to eq('project')
      expect(parsed_response[1]['columns']).to match_array(
        [
          { 'name' => 'Email', 'type' => 'String', 'accessor_access' => true,
            'dashboard_use' => true, 'visible_in_list' => true },
          { 'name' => 'Name', 'type' => 'String', 'accessor_access' => true,
            'dashboard_use' => true, 'visible_in_list' => true }
        ]
      )
      expect(parsed_response[1]['record']).to eq({
        'id' => project_datasheet_row.id, 'Email' => 'james@cc.com', 'Name' => 'James S'
      })
    end
  end

  describe 'POST create' do
    it 'creates datasheet_row with only columns defined in datasheet' do
      get :create, params: {
        new_campaign_id: campaign.id, 'Email' => 'mark@cc.com', 'Name' => 'Mark', 'Company' => 'Abctech'
      }, format: :json

      datasheet_row = datasheet.rows.find_by(email: 'mark@cc.com')
      expect(datasheet_row.data).to eq({ 'Email' => 'mark@cc.com', 'Name' => 'Mark' })

      parsed_response = JSON.parse(response.body)
      expect(parsed_response).to eq({
        'id' => datasheet_row.id, 'Email' => 'mark@cc.com', 'Name' => 'Mark'
      })
    end

    it 'renders error if email is invalid' do
      get :create, params: {
        new_campaign_id: campaign.id, 'Name' => 'Mark', 'Company' => 'Abctech'
      }, format: :json

      parsed_response = JSON.parse(response.body)
      expect(parsed_response).to eq({ 'errors' => ["Email can't be blank"] })
    end
  end

  describe 'PUT update' do
    it 'updates datasheet_row with only columns defined in datasheet' do
      get :update, params: {
        new_campaign_id: campaign.id, id: datasheet_row.id, 'Name' => 'James Smith', 'Company' => 'Abctech'
      }, format: :json

      expect(datasheet_row.reload.data).to eq({ 'Name' => 'James Smith' })

      parsed_response = JSON.parse(response.body)
      expect(parsed_response).to eq({
        'id' => datasheet_row.id, 'Email' => 'james@cc.com', 'Name' => 'James Smith'
      })
    end
  end

  describe 'DELETE bulk_delete' do
    it 'bulk deletes datasheet_row' do
      datasheet_row2 = create(:datasheet_row, datasheet: datasheet, email: 'smith@cc.com', data: { 'Name' => 'Smith' })

      delete :bulk_delete,
             params: { new_campaign_id: campaign.id, ids: [datasheet_row.id, datasheet_row2.id] }, format: :json

      expect(DatasheetRow.find_by(id: datasheet_row.id)).to eq(nil)
      expect(DatasheetRow.find_by(id: datasheet_row2.id)).to eq(nil)
    end
  end

  describe 'PUT import' do
    it 'sends errors if imported xlsx is not valid' do
      file = Rack::Test::UploadedFile.new(
        Rails.root.join('spec/fixtures/files/datasheet/invalid_file.xlsx'), 'application/xlsx'
      )
      put :import, params: {
        new_campaign_id: campaign.id,
        operation: 'replace_existing',
        file: file
      }
      parsed_response = JSON.parse(response.body)

      expect(parsed_response['errors']).to eq(['File does not contain Email column'])
    end

    it 'create AdminJobRecord for import_datasheet job if file is valid' do
      file = Rack::Test::UploadedFile.new(
        Rails.root.join('spec/fixtures/files/datasheet/valid_file.xlsx'), 'application/xlsx'
      )
      put :import, params: {
        new_campaign_id: campaign.id,
        operation: 'replace_existing',
        file: file
      }

      expect(AdminJobRecord.exists?(operation: 'import_datasheet')).to be_truthy
    end
  end

  describe 'GET export' do
    it 'sends xlsx file' do
      data = 'data'
      xlsx = double
      allow(xlsx).to receive_message_chain(:to_stream, :read) { data }
      expect(::Datasheets::Export).to receive(:call!).with(datasheet).and_return(xlsx)
      expect(controller).to receive(:send_data).with(data, filename: "datasheet-for-#{campaign.name}.xlsx")

      get :export, format: 'xlsx', params: { new_campaign_id: campaign.id }
    end
  end
end
