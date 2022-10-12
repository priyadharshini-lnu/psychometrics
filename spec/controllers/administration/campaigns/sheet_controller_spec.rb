# frozen_string_literal: true

require 'rails_helper'
RSpec.describe Administration::Campaigns::SheetsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let!(:sheet) do
    create(:sheet, campaign: campaign, columns: [{
      name: 'Email', type: 'String', accessor_access: true, dashboard_use: true, visible_in_list: true
    }])
  end

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  describe 'POST create column' do
    it 'creates sheet column' do
      post :add_column, params: {
        new_campaign_id: campaign.id,
        column: {
          name: 'test', type: 'String', accessor_access: true, dashboard_use: true, visible_in_list: true
        },
        type: 'Datasheet'
      }, format: :json

      expect(sheet.reload.columns).to eq([
        { 'name' => 'Email', 'type' => 'String', 'accessor_access' => true,
          'dashboard_use' => true, 'visible_in_list' => true },
        { 'name' => 'test', 'type' => 'String', 'accessor_access' => true,
          'dashboard_use' => true, 'visible_in_list' => true }
      ])

      parsed_response = JSON.parse(response.body)
      expect(parsed_response).to eq([
        { 'name' => 'Email', 'type' => 'String', 'accessor_access' => true,
          'dashboard_use' => true, 'visible_in_list' => true },
        { 'name' => 'test', 'type' => 'String', 'accessor_access' => true,
          'dashboard_use' => true, 'visible_in_list' => true }
      ])
    end

    it 'renders error if column is invalid' do
      get :add_column, params: {
        new_campaign_id: campaign.id,
        column: {
          name: 'E' * 65, type: 'WrongType', accessor_access: true, dashboard_use: true, visible_in_list: true
        },
        type: 'Datasheet'
      }, format: :json

      parsed_response = JSON.parse(response.body)
      expect(parsed_response).to eq({ 'errors' => { 'name' => ['is too long (maximum is 64 characters)'],
                                                    'type' => ['is not included in the list'] } })
    end

    it 'allows for more than 64 characters if dashboard_use is false' do
      get :add_column, params: {
        new_campaign_id: campaign.id,
        column: {
          name: 'E' * 65, type: 'String', accessor_access: true, dashboard_use: false, visible_in_list: true
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
          name: 'Email', type: 'String', accessor_access: false, dashboard_use: true, visible_in_list: true
        },
        type: 'Datasheet'
      }, format: :json

      expect(sheet.reload.columns).to eq([
        { 'name' => 'Email', 'type' => 'String', 'accessor_access' => false,
          'dashboard_use' => true, 'visible_in_list' => true }
      ])

      parsed_response = JSON.parse(response.body)
      expect(parsed_response).to eq([
        { 'name' => 'Email', 'type' => 'String', 'accessor_access' => false,
          'dashboard_use' => true, 'visible_in_list' => true }
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

      expect(sheet.columns.map { |c| c['name'] }).to eq(%w[Email Name Profile])

      put :update_columns_order, params: {
        new_campaign_id: campaign.id,
        columns: [
          { name: 'Email', type: 'String', accessor_access: true, dashboard_use: true, visible_in_list: true },
          { name: 'Profile', type: 'String', accessor_access: true, dashboard_use: true, visible_in_list: true },
          { name: 'Name', type: 'String', accessor_access: true, dashboard_use: true, visible_in_list: true }
        ],
        type: 'Datasheet'
      }

      expect(sheet.reload.columns.map { |c| c['name'] }).to eq(%w[Email Profile Name])
    end
  end

  describe 'DELETE remove_columns' do
    it 'should delete column should delete data from row' do
      sheet.update(columns: [
        { name: 'Email', type: 'String', accessor_access: true, dashboard_use: true, visible_in_list: true },
        { name: 'Name', type: 'String', accessor_access: true, dashboard_use: true, visible_in_list: true },
        { name: 'Profile', type: 'String', accessor_access: true, dashboard_use: true, visible_in_list: true }
      ])
      row = create(:sheet_row, sheet: sheet, email: 'james@cc.com',
        data: { 'Name' => 'James', 'Profile' => 'Software Engineer' })

      expect(row.data.keys).to eq(%w[Name Profile])

      delete :remove_columns, params: { new_campaign_id: campaign.id, columns: ['Profile'], type: 'Datasheet' },
        format: :json

      expect(row.reload.data.keys).to eq(['Name'])
    end
  end
end
