# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Assessors::WorkshopsController, type: :controller do
  render_views

  let(:current_user) { create(:user, :assessor) }

  describe 'index' do
    it 'renders the shared admin entrypoint for an assessor' do
      login_user(current_user)

      get :index

      expect(response).to render_template('shared/frontend_entry')
      expect(response.body).to include('admin-app-container')
    end

    it 'renders the entrypoint for a non-assessor without signing them out' do
      login_user(create(:superadmin))

      get :index

      expect(response).to render_template('shared/frontend_entry')
      expect(controller.current_user).not_to be_nil
    end
  end
end
