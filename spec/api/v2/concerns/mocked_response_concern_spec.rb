# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::Concerns::MockedResponse, type: :controller do
  controller(Api::V2::Administration::NormsController) do
    include Api::V2::Administration::Concerns::MockedResponse

    def permitted_params
      params.require(:data).require(:attributes).permit(:name)
    end
  end

  describe 'mock_crud_actions' do
    it 'sets the mocked actions' do
      controller.class.mock_crud_actions(only: %i[index show])
      expect(controller.class.mocked_actions).to eq(%i[index show])
    end
  end

  describe 'mock_custom_actions' do
    it 'sets the custom mocked actions' do
      controller.class.mock_custom_actions(%i[custom_action])
      expect(controller.class.custom_mocked_actions).to eq(%i[custom_action])
    end
  end

  describe 'handle_mocked_response' do
    before do
      allow(File).to receive(:exist?).and_return(true)
      allow(File).to receive(:read).and_return(
        { data: [{ id: '1', attributes: { name: 'test' } }] }.to_json
      )
    end

    it 'renders mocked response for index action' do
      controller.class.mock_crud_actions(only: %i[index])
      get :index
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq(
        'data' => [{ 'id' => '1', 'attributes' => { 'name' => 'test' } }]
      )
    end

    it 'renders mocked response for show action' do
      controller.class.mock_crud_actions(only: %i[show])
      get :show, params: { id: '1' }
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq(
        'data' => { 'id' => '1', 'attributes' => { 'name' => 'test' } }
      )
    end

    it 'renders mocked response for create action' do
      controller.class.mock_crud_actions(only: %i[create])
      post :create, params: { data: { attributes: { name: 'new' } } }
      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)).to eq(
        'data' => { 'id' => '2', 'type' => 'norm', 'attributes' => { 'name' => 'new' } }
      )
    end

    it 'renders mocked response for update action' do
      controller.class.mock_crud_actions(only: %i[update])
      patch :update, params: { id: '1', data: { attributes: { 'name' => 'updated' } } }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq(
        'data' => { 'id' => '1', 'attributes' => { 'name' => 'updated' } }
      )
    end

    it 'renders mocked response for destroy action' do
      controller.class.mock_crud_actions(only: %i[destroy])
      delete :destroy, params: { id: '1' }
      expect(response).to have_http_status(:no_content)
      expect(JSON.parse(response.body)).to eq('data' => [])
    end
  end
end
