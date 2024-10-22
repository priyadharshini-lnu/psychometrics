# frozen_string_literal: true

require 'rails_helper'
RSpec.describe Administration::Projects::SheetsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:project) { create(:project) }
  let!(:sheet) do
    create(:sheet, project: project, columns: [{
      name: 'Email', type: 'String', accessor_access: true, dashboard_use: true, visible_in_list: true
    }])
  end
  let!(:column1) do
    create(:sheet_column, sheet: sheet, name: 'Email', column_type: 'string',
            accessor_access: true, dashboard_use: true, visible_in_list: true)
  end
  let!(:columns) do
    sheet.sheet_columns << column1
  end

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  describe 'POST create column' do
    it 'creates sheet column' do
      post :add_column, params: {
        project_id: project.id,
        column: {
          name: 'test', column_type: 'string', accessor_access: true, dashboard_use: true, visible_in_list: true
        }
      }, format: :json

      expect(sheet.reload.sheet_columns.map(&:name)).to eq(%w[Email test])
      last_id = sheet.reload.sheet_columns.last.id
      parsed_response = JSON.parse(response.body)
      expect(parsed_response).to eq([
        { 'id' => column1.id, 'name' => 'Email', 'column_type' => 'string', 'accessor_access' => true,
          'dashboard_use' => true, 'visible_in_list' => true, 'position' => 0 },
        { 'id' => last_id, 'name' => 'test', 'column_type' => 'string', 'accessor_access' => true,
          'dashboard_use' => true, 'visible_in_list' => true, 'position' => 1 }
      ])
    end

    it 'renders error if column is invalid' do
      get :add_column, params: {
        project_id: project.id,
        column: { name: 'E' * 65, type: 'WrongType', accessor_access: true, dashboard_use: true, visible_in_list: true }
      }, format: :json

      parsed_response = JSON.parse(response.body)
      expect(parsed_response).to eq({ 'errors' => { 'name' => ['is too long (maximum is 64 characters)'],
                                                    'column_type' => ['is not included in the list'] } })
    end
  end

  describe 'PUT update_column' do
    it 'updates sheet_row with only columns defined in sheet' do
      put :update_column, params: {
        project_id: project.id,
        column: {
          id: column1.id, name: 'Email', column_type: 'string',
          accessor_access: false, dashboard_use: true, visible_in_list: true
        }
      }, format: :json

      expect(column1.reload.accessor_access).to eq(false)

      parsed_response = JSON.parse(response.body)
      expect(parsed_response).to eq([
        { 'id' => column1.id, 'name' => 'Email', 'column_type' => 'string', 'accessor_access' => false,
          'dashboard_use' => true, 'visible_in_list' => true, 'position' => 0 }
      ])
    end
  end

  describe 'PUT update_columns_order' do
    it 'should update order of columns' do
      sheet.update(columns: [
        { name: 'Email', type: 'String', accessor_access: true, dashboard_use: true, visible_in_list: true },
        { name: 'Name', type: 'String', accessor_access: true, dashboard_use: true, visible_in_list: true },
        { name: 'Profile', type: 'String', accessor_access: true, dashboard_use: true, visible_in_list: true }
      ])
      col_name = create(:sheet_column, sheet: sheet, name: 'Name', column_type: 'string')
      col_profile = create(:sheet_column, sheet: sheet, name: 'Profile', column_type: 'string')
      sheet.sheet_columns << col_name
      sheet.sheet_columns << col_profile

      expect(sheet.sheet_columns.map(&:name)).to eq(%w[Email Name Profile])

      put :update_columns_order, params: {
        project_id: project.id,
        columns: [
          { id: column1.id, name: 'Email', column_type: 'string', accessor_access: true, dashboard_use: true,
            visible_in_list: true },
          { id: col_profile.id, name: 'Profile', column_type: 'string', accessor_access: true, dashboard_use: true,
            visible_in_list: true },
          { id: col_name.id, name: 'Name', column_type: 'string', accessor_access: true, dashboard_use: true,
            visible_in_list: true }
        ]
      }

      expect(sheet.reload.sheet_columns.order(:position).map(&:name)).to eq(%w[Email Profile Name])
    end
  end

  describe 'DELETE remove_columns' do
    it 'should delete column should delete data from row' do
      sheet.update(columns: [
        { name: 'Email', type: 'String', accessor_access: true, dashboard_use: true, visible_in_list: true },
        { name: 'Name', type: 'String', accessor_access: true, dashboard_use: true, visible_in_list: true },
        { name: 'Profile', type: 'String', accessor_access: true, dashboard_use: true, visible_in_list: true }
      ])
      col_name = create(:sheet_column, sheet: sheet, name: 'Name', column_type: 'string')
      col_profile = create(:sheet_column, sheet: sheet, name: 'Profile', column_type: 'string')
      sheet.sheet_columns << col_name
      sheet.sheet_columns << col_profile

      row = create(:sheet_row, sheet: sheet, email: 'james@cc.com',
        data: { 'Name' => 'James', 'Profile' => 'Software Engineer' })

      expect(row.data.keys).to eq(%w[Name Profile])

      delete :remove_columns, params: { project_id: project.id, column_ids: [col_profile.id] }, format: :json

      expect(row.reload.data.keys).to eq(['Name'])
    end
  end
end
