# frozen_string_literal: true

require 'rails_helper'
RSpec.describe Administration::Projects::SheetRowsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:project) { create(:project) }
  let(:sheet) do
    create(:sheet, project: project, columns: [
      { name: 'Email', type: 'String', accessor_access: true, dashboard_use: true, visible_in_list: true },
      { name: 'Name', type: 'String', accessor_access: true, dashboard_use: true, visible_in_list: true },
      { name: 'Profile', type: 'Markdown', accessor_access: true, dashboard_use: true, visible_in_list: true },
      { name: 'Description', type: 'HTML', accessor_access: true, dashboard_use: true, visible_in_list: true }
    ])
  end
  let!(:columns) do
    [
      create(:sheet_column, sheet: sheet, name: 'Email', column_type: 'string',
                                  accessor_access: true, dashboard_use: true, visible_in_list: true),
      create(:sheet_column, sheet: sheet, name: 'Name', column_type: 'string',
                                    accessor_access: true, dashboard_use: true, visible_in_list: true),
      create(:sheet_column, sheet: sheet, name: 'Profile', column_type: 'markdown',
                                    accessor_access: true, dashboard_use: true, visible_in_list: true),
      create(:sheet_column, sheet: sheet, name: 'Description', column_type: 'html',
                                  accessor_access: true, dashboard_use: true, visible_in_list: true)
    ]
  end
  let!(:sheet_row) do
    create(:sheet_row, sheet: sheet, email: 'james@cc.com')
  end
  let!(:sheet_row_data) do
    ::SheetRows::UpsertData.call(sheet, sheet_row.email, {
      'Email' => 'james@cc.com', 'Name' => 'James', 'Profile' => 'Software Engineer', 'Description' => 'J1'
    })
  end

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  describe 'GET index' do
    it 'renders sheet_row json without HTML and Markdown type on json request' do
      sheet_row2 = create(:sheet_row, sheet: sheet, email: 'smith@cc.com')
      ::SheetRows::UpsertData.call(sheet, sheet_row2.email, {
        'Email' => 'smith@cc.com', 'Name' => 'Smith', 'Profile' => 'Carpenter', 'Description' => 'S1'
      })

      get :index, params: { project_id: project.id }, format: :json
      parsed_response = JSON.parse(response.body)

      expect(parsed_response['columns']).to match_array(
        [
          { 'id' => columns[0].id, 'name' => 'Email', 'column_type' => 'string', 'accessor_access' => true,
            'dashboard_use' => true, 'visible_in_list' => true, 'position' => 0 },
          { 'id' => columns[1].id, 'name' => 'Name', 'column_type' => 'string', 'accessor_access' => true,
            'dashboard_use' => true, 'visible_in_list' => true, 'position' => 1  },
          { 'id' => columns[2].id, 'name' => 'Profile', 'column_type' => 'markdown', 'accessor_access' => true,
            'dashboard_use' => true, 'visible_in_list' => true, 'position' => 2  },
          { 'id' => columns[3].id, 'name' => 'Description', 'column_type' => 'html', 'accessor_access' => true,
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
    it 'returns data_sheet record with all types' do
      get :show, params: { id: sheet_row.id, project_id: project.id }, format: :json
      parsed_response = JSON.parse(response.body)

      expect(parsed_response[0]['type']).to eq('project')
      expect(parsed_response[0]['columns']).to match_array(
        [
          { 'id' => columns[0].id, 'name' => 'Email', 'column_type' => 'string', 'accessor_access' => true,
            'dashboard_use' => true, 'visible_in_list' => true, 'position' => 0 },
          { 'id' => columns[1].id, 'name' => 'Name', 'column_type' => 'string', 'accessor_access' => true,
            'dashboard_use' => true, 'visible_in_list' => true, 'position' => 1  },
          { 'id' => columns[2].id, 'name' => 'Profile', 'column_type' => 'markdown', 'accessor_access' => true,
            'dashboard_use' => true, 'visible_in_list' => true, 'position' => 2  },
          { 'id' => columns[3].id, 'name' => 'Description', 'column_type' => 'html', 'accessor_access' => true,
            'dashboard_use' => true, 'visible_in_list' => true, 'position' => 3  }
        ]
      )
      expect(parsed_response[0]['record']).to eq({
        'id' => sheet_row.id, 'Email' => 'james@cc.com', 'Name' => 'James', 'Profile' => 'Software Engineer',
        'Description' => 'J1'
      })
    end
  end

  describe 'POST create' do
    it 'creates sheet_row with only columns defined in sheet' do
      get :create, params: {
        project_id: project.id, 'Email' => 'mark@cc.com', 'Name' => 'Mark', 'Company' => 'Abctech'
      }, format: :json

      sheet_row = sheet.rows.find_by(email: 'mark@cc.com')

      parsed_response = JSON.parse(response.body)
      expect(parsed_response).to eq({
        'id' => sheet_row.id, 'Email' => 'mark@cc.com', 'Name' => 'Mark'
      })
    end

    it 'renders error if email is invalid' do
      get :create, params: {
        project_id: project.id, 'Name' => 'Mark', 'Company' => 'Abctech'
      }, format: :json

      parsed_response = JSON.parse(response.body)
      expect(parsed_response).to eq({ 'errors' => { 'email' => ["Email can't be blank"] } })
    end
  end

  describe 'PUT update' do
    it 'updates sheet_row with only columns defined in sheet' do
      get :update, params: {
        project_id: project.id, id: sheet_row.id, 'Name' => 'James Smith', 'Company' => 'Abctech'
      }, format: :json

      parsed_response = JSON.parse(response.body)
      expect(parsed_response).to eq({
        'id' => sheet_row.id, 'Email' => 'james@cc.com', 'Name' => 'James Smith',
        'Description' => 'J1', 'Profile' => 'Software Engineer'
      })
      expect(sheet_row.sheet_row_data[0].string_value).to eq('james@cc.com')
      expect(sheet_row.sheet_row_data[1].string_value).to eq('James Smith')
    end
  end

  describe 'DELETE bulk_delete' do
    it 'bulk deletes sheet_row' do
      sheet_row2 = create(:sheet_row, sheet: sheet, email: 'smith@cc.com')

      delete :bulk_delete,
             params: { project_id: project.id, ids: [sheet_row.id, sheet_row2.id] }, format: :json

      expect(SheetRow.find_by(id: sheet_row.id)).to eq(nil)
      expect(SheetRow.find_by(id: sheet_row2.id)).to eq(nil)
    end
  end

  describe 'PUT import' do
    it 'sends errors if imported xlsx is not valid' do
      file = Rack::Test::UploadedFile.new(
        Rails.root.join('spec/fixtures/files/sheet/invalid_file.xlsx'), 'application/xlsx'
      )
      put :import, params: {
        project_id: project.id,
        file: file
      }
      parsed_response = JSON.parse(response.body)

      expect(parsed_response['errors']).to eq(['File does not contain Email column'])
    end

    it 'create AdminJobRecord for import_sheet job if file is valid' do
      file = Rack::Test::UploadedFile.new(
        Rails.root.join('spec/fixtures/files/sheet/valid_file.xlsx'), 'application/xlsx'
      )
      put :import, params: {
        project_id: project.id,
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
      expect(::Sheets::Export).to receive(:call!).with(sheet).and_return(xlsx)
      expect(controller).to receive(:send_data).with(data, filename: "datasheet-export-for-#{project.name}.xlsx")

      get :export, format: 'xlsx', params: { project_id: project.id, type: 'Datasheet' }
    end
  end
end
