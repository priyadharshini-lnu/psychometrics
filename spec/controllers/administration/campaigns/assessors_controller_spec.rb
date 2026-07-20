# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Campaigns::AssessorsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:assessor) { create(:assessor) }
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let!(:assessment1) do
    create(:assessment, category: :assessor_form, name: 'A 1', owner_id: project.parent.id, created_by: current_user)
  end
  let!(:assessment2) do
    create(:assessment, category: :assessor_form, name: 'A 2', owner_id: project.parent.id, created_by: current_user)
  end
  let(:user) { create(:user) }
  let!(:subject) do
    user = create(:user, project: campaign.project, email: 'fedor@gmail.com')
    create(:campaign_user, user: user, campaign: campaign)
    user
  end

  before(:each) { login_user(current_user) }
  before(:each) { create(:relationship, name: Relationship::ASSESSOR, type: :global) }
  after(:each) { sign_out(current_user) }

  describe 'index' do
    it 'returns assesor details' do
      get :index, params: { new_campaign_id: assessor.campaign_id }, format: :json

      parsed_response = response.parsed_body

      expect(parsed_response['total']).to eq(1)
      expect(parsed_response['list']).to eq([{
        'id' => assessor.id,
        'full_name' => assessor.user.decorate.full_name,
        'email' => assessor.user.email,
        'status' => 'completed',
        'completed_evaluations' => 0,
        'total_evaluations' => 0,
        'permissions' => {
          'login_as' => true,
          'remove' => true
        }
      }])
    end
  end

  describe 'destroy' do
    it 'destroys the assessor record' do
      delete :destroy, params: { new_campaign_id: assessor.campaign_id, id: assessor.id }, format: :json

      expect(Assessor.find_by(id: assessor.id)).to eq(nil)
    end
  end

  it '[GET] available_assessments' do
    get :available_assessments, params: {
      new_campaign_id: campaign.id
    }, as: :json

    parsed_response = response.parsed_body

    expect(parsed_response).to eq(
      [{ 'id' => assessment1.id, 'name' => 'A 1' }, { 'id' => assessment2.id, 'name' => 'A 2' }]
    )
  end

  it '[POST] create_all' do
    post :create_all, params: {
      new_campaign_id: campaign.id,
      assessors: [
        {
          assessor_email: 'existing.atanov@gmail.com',
          assessor_first_name: 'Vlad',
          assessor_last_name: 'Ata',
          subject_email: 'fedor@gmail.com',
          assessment_ids: [assessment1.id]
        }
      ]
    }
    parsed_response = response.parsed_body

    expect(parsed_response).to eq('ok')
  end

  describe 'GET show' do
    it 'renders assessor user details' do
      get :show, params: { new_campaign_id: assessor.campaign_id, id: assessor.id }, format: :json

      parsed_response = response.parsed_body
      expect(parsed_response).to eq({
        'id' => assessor.user_id,
        'email' => assessor.user.email,
        'full_name' => assessor.user.decorate.full_name,
        'completed_evaluations' => 0,
        'total_evaluations' => 0,
        'evaluation_completion_status' => 'completed',
        'moderation_completion_status' => 'completed',
        'completed_moderation' => 0,
        'total_moderation' => 0,
        'permissions' => {
          'add_subject' => true,
          'remove_subject' => true
        },
        'assessor_can_moderate_scores' => false
      })
    end
  end

  describe 'GET spoof' do
    it 'sign_in assessor and redirects to assessors_dashboard_path' do
      allow(AdminSubdomain).to receive(:client_admin_sso_enabled?).and_return(false)
      expect(controller).to receive(:sign_in).with(assessor.user, skip_session_limitable: true)

      get :spoof, params: { new_campaign_id: assessor.campaign_id, id: assessor.id }

      expect(response).to redirect_to(assessors_dashboard_path)
    end
  end
end
