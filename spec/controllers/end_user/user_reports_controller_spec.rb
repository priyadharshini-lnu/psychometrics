# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EndUser::UserReportsController, type: :controller do
  # let(:current_user) { create(:superadmin) }
  let(:user) { create(:user, :with_project_membership, :with_photo) }
  let(:campaign) { create(:campaign, project_id: user.project_id) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let(:user_report) { create(:user_report, user: campaign_user.user) }

  before(:each) { login_user(user) }
  after(:each) { sign_out(user) }

  describe 'GET pdf_preview' do
    it 'renders appropriate view' do
      get :pdf_preview, params: { id: user_report.id, user_token: user.authentication_token }

      expect(response).to render_template('layouts/pdf')
      expect(response).to render_template('shared/preview_report')
    end
  end
end
