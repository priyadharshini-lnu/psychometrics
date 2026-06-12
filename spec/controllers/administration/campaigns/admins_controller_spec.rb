# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Campaigns::AdminsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let!(:campaign_admin_membership) { create :campaign_admin_membership, campaign: campaign }

  let(:resource_params) do
    {
      'resource' => {
        'user_attributes' =>
          {
            'email' => 'prakalp@email.com',
            'first_name' => 'Prakalp',
            'last_name' => 'Jadhav'
          },
        'grants_attributes' =>
          {
            'data' =>
              {
                'projects' => ['view'],
                'assessments' => ['view'],
                'communications' => %w[view manage],
                'reports' => ['view']
              }
          }
      },
      new_campaign_id: campaign.id
    }
  end

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  describe 'GET spoof' do
    it 'sign_in assessor and redirects to assessors_dashboard_path' do
      expect(controller).to receive(:sign_in).with(campaign_admin_membership.user, skip_session_limitable: true)

      get :spoof, params: { new_campaign_id: campaign_admin_membership.campaign_id, id: campaign_admin_membership.id }

      expect(response).to redirect_to(admin_path)
    end
  end

  describe 'GET reset_password' do
    it 'sends email to user to reset password' do
      get :reset_password, params: { new_campaign_id: campaign.id, id: campaign_admin_membership.id }
      expect(ActionMailer::Base.deliveries.count(1))
      expect(ActionMailer::Base.deliveries.first.subject).to eq('Instructions for resetting your password')
      expect(response).to have_http_status(:success)
    end
  end

  it 'index' do
    get :index, params: {
      new_campaign_id: campaign.id,
      project_id: campaign.project_id
    }, format: :json

    parsed_response = response.parsed_body

    expect(parsed_response['total']).to eq(1)

    expect(parsed_response['list']).to eq([expected_response_with_permissions(campaign_admin_membership)])
  end

  it 'show' do
    get :show, params: {
      id: campaign_admin_membership.id,
      new_campaign_id: campaign.id,
      project_id: campaign.project_id
    }

    parsed_response = response.parsed_body

    expect(parsed_response).to eq(expected_reponse_with_grants_and_permissions(campaign_admin_membership))
  end

  it 'destroy' do
    delete :destroy, params: {
      id: campaign_admin_membership.id,
      new_campaign_id: campaign.id,
      project_id: campaign.project_id
    }

    parsed_response = response.parsed_body

    expect(parsed_response).to eq({ 'id' => campaign_admin_membership.id })

    expect(response.status).to eq(200)
  end

  it 'create' do
    post :create, params: resource_params

    parsed_response = response.parsed_body

    membership = Membership.joins(:user).where(
      'users.email = (?)', resource_params['resource']['user_attributes']['email']
    ).last

    expect(parsed_response).to eq(expected_response_with_permissions(membership))

    expect(response.status).to eq(200)
  end

  private

  def expected_response_with_permissions(admin)
    {
      'id' => admin.id,
      'user_id' => admin.user_id,
      'first_name' => admin.user.first_name,
      'last_name' => admin.user.last_name,
      'email' => admin.user.email,
      'created_at' => I18n.l(admin.created_at, format: :short),
      'permissions' => {
        'loginAs' => true,
        'edit' => true,
        'remove' => true,
        'resetPassword' => true,
        'sendMail' => true
      }
    }
  end

  def expected_reponse_with_grants_and_permissions(admin)
    {
      'id' => admin.id,
      'user_id' => admin.user_id,
      'first_name' => admin.user.first_name,
      'last_name' => admin.user.last_name,
      'email' => admin.user.email,
      'created_at' => I18n.l(admin.created_at, format: :short),
      'permissions' => {
        'loginAs' => true,
        'edit' => true,
        'remove' => true,
        'resetPassword' => true,
        'sendMail' => true
      },
      'grants' => {
        'id' => admin.grants.id,
        'membership_id' => admin.grants.membership_id,
        'data' => admin.grants.data
      },
      'campaigns' => [{ 'id' => admin.campaign_id, 'name' => admin.campaign.name }]
    }
  end
end
