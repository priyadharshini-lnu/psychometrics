# frozen_string_literal: true

require 'rails_helper'

RSpec.describe User, type: :model do
  it { should have_many(:api_keys).inverse_of(:user) }
  it { should have_many(:user_assessments).inverse_of(:subject) }
  it { should have_many(:assessments).through(:user_assessments) }
  it { should have_many(:user_reports).inverse_of(:user) }

  describe '#send_two_factor_authentication_code' do
    it 'enqueues sending the two factor code' do
      allow(SendTwoFactorCodeJob).to receive(:perform_later)
      user = create(:user)

      user.send_two_factor_authentication_code('123456')

      expect(SendTwoFactorCodeJob).to have_received(:perform_later)
    end
  end

  describe '.with_access_to_campaign' do
    it 'returns only admins that have access to a campaign' do
      campaign = create(:campaign)
      super_admin = create(:superadmin)
      client_admin_without_access = create(:client_admin)
      project_admin_without_access = create(:project_admin)
      client_admin_with_access = create(:client_admin)
      create(:membership, client: campaign.client, user: client_admin_with_access, role: :client_admin)
      project_admin_with_access = create(:project_admin)
      create(:membership, client: campaign.project, user: project_admin_with_access)

      results = User.with_access_to_campaign(campaign.id)
      expect(results).to include(super_admin)
      expect(results).to include(client_admin_with_access)
      expect(results).to include(project_admin_with_access)
      expect(results).not_to include(client_admin_without_access)
      expect(results).not_to include(project_admin_without_access)
    end
  end
end
