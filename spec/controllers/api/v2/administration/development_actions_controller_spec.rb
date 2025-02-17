# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::DevelopmentActionsController, type: :controller do
  let(:project) { create(:project) }
  let(:project_manager) { create(:superadmin) }
  let(:unauthorized_user) { create(:user) }

  context 'when user is authorized' do
    before do
      sign_in project_manager
      allow_any_instance_of(Api::Administration::DevelopmentActionPolicy).to receive(:export?).and_return(true)
    end

    it 'queues export job' do
      expect do
        get :export, params: { project_id: project.id }
      end.to change(AdminJobRecord, :count).by(1)

      expect(response).to have_http_status(:ok)
    end
  end

  context 'when user is not authorized' do
    before do
      sign_in unauthorized_user
      allow_any_instance_of(Api::Administration::DevelopmentActionPolicy).to receive(:export?).and_return(false)
    end

    it 'returns forbidden status' do
      get :export, params: { project_id: project.id }
      expect(response).to have_http_status(:not_found)
    end
  end
end
