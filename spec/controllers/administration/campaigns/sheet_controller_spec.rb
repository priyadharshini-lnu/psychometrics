# frozen_string_literal: true

require 'rails_helper'
RSpec.describe Administration::Campaigns::SheetsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let!(:sheet) do
    create(:sheet, campaign: campaign)
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
        new_campaign_id: campaign.id,
        column: {
          name: 'test', column_type: 'string', accessor_access: true, dashboard_use: true, visible_in_list: true
        },
        type: 'Datasheet'
      }, format: :json

      expect(sheet.reload.sheet_columns.map(&:name)).to eq(%w[Email test])
      last_id = sheet.reload.sheet_columns.last.id
      parsed_response = response.parsed_body
      expect(parsed_response).to eq([
        { 'id' => column1.id, 'name' => 'Email', 'column_type' => 'string', 'accessor_access' => true,
          'dashboard_use' => true, 'visible_in_list' => true, 'position' => 0 },
        { 'id' => last_id, 'name' => 'test', 'column_type' => 'string', 'accessor_access' => true,
          'dashboard_use' => true, 'visible_in_list' => true, 'position' => 1 }
      ])
    end

    it 'renders error if column is invalid' do
      get :add_column, params: {
        new_campaign_id: campaign.id,
        column: {
          name: 'E' * 65, column_type: 'WrongType', accessor_access: true, dashboard_use: true, visible_in_list: true
        },
        type: 'Datasheet'
      }, format: :json

      parsed_response = response.parsed_body
      expect(parsed_response).to eq({ 'errors' => { 'name' => ['is too long (maximum is 64 characters)'],
                                                    'column_type' => ['is not included in the list'] } })
    end

    it 'allows for more than 64 characters if dashboard_use is false' do
      get :add_column, params: {
        new_campaign_id: campaign.id,
        column: {
          name: 'E' * 65, column_type: 'string', accessor_access: true, dashboard_use: false, visible_in_list: true
        },
        type: 'Datasheet'
      }, format: :json

      expect(response.status).to eq(200)
    end
  end

  describe 'PUT update_column' do
    it 'updates sheet_row with only columns defined in sheet' do
      put :update_column, params: {
        new_campaign_id: campaign.id,
        column: {
          id: column1.id, name: 'Email',
          column_type: 'string',
          accessor_access: false, dashboard_use: true, visible_in_list: true
        },
        type: 'Datasheet'
      }, format: :json

      expect(column1.reload.accessor_access).to eq(false)

      parsed_response = response.parsed_body
      expect(parsed_response).to eq([
        { 'id' => column1.id, 'name' => 'Email', 'column_type' => 'string', 'accessor_access' => false,
          'dashboard_use' => true, 'visible_in_list' => true, 'position' => 0 }
      ])
    end
  end

  describe 'PUT update_columns_order' do
    it 'should update order of columns' do
      col_name = create(:sheet_column, sheet: sheet, name: 'Name', column_type: 'string')
      col_profile = create(:sheet_column, sheet: sheet, name: 'Profile', column_type: 'string')
      sheet.sheet_columns << col_name
      sheet.sheet_columns << col_profile

      expect(sheet.sheet_columns.map(&:name)).to eq(%w[Email Name Profile])

      put :update_columns_order, params: {
        new_campaign_id: campaign.id,
        columns: [
          { id: column1.id, name: 'Email', column_type: 'string', accessor_access: true, dashboard_use: true,
            visible_in_list: true },
          { id: col_profile.id, name: 'Profile', column_type: 'string', accessor_access: true, dashboard_use: true,
            visible_in_list: true },
          { id: col_name.id, name: 'Name', column_type: 'string', accessor_access: true, dashboard_use: true,
            visible_in_list: true }
        ],
        type: 'Datasheet'
      }

      expect(sheet.reload.sheet_columns.order(:position).map(&:name)).to eq(%w[Email Profile Name])
    end
  end

  describe 'DELETE remove_columns' do
    it 'should delete column should delete data from row' do
      col_name = create(:sheet_column, sheet: sheet, name: 'Name', column_type: 'string')
      col_profile = create(:sheet_column, sheet: sheet, name: 'Profile', column_type: 'string')
      sheet.sheet_columns << col_name
      sheet.sheet_columns << col_profile

      row = create(:sheet_row, sheet: sheet, email: 'james@cc.com')
      row.sheet_row_data.create(sheet_column: col_name, string_value: 'James')
      row.sheet_row_data.create(sheet_column: col_profile, string_value: 'Software Engineer')

      expect(sheet.sheet_columns.map(&:name)).to eq(%w[Email Name Profile])
      delete :remove_columns, params: { new_campaign_id: campaign.id, column_ids: [col_profile.id], type: 'Datasheet' },
        format: :json

      expect(sheet.sheet_columns.reload.map(&:name)).to eq(%w[Email Name])
      expect(row.reload.sheet_row_data.map(&:string_value)).to eq(['James'])
    end
  end
end
