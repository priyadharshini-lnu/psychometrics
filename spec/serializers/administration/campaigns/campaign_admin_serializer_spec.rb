# frozen_string_literal: true

require 'rails_helper'

describe Administration::Campaigns::CampaignAdminSerializer do
  let(:project_admin_membership) { create(:project_admin_membership) }
  let(:current_user) { project_admin_membership.user }
  let(:campaign) { create(:campaign) }
  let(:campaign_admin_membership) do
    create(:campaign_admin_membership, user: current_user, campaign: campaign)
  end
  let(:policy) do
    Administration::Campaigns::AdminPolicy.new(
      current_user, campaign_admin_membership, { project_id: campaign.project_id }
    )
  end

  subject do
    described_class.new(campaign_admin_membership, current_user: current_user, project_id: campaign.project_id).to_h
  end

  it do
    is_expected.to eq(
      id: campaign_admin_membership.id,
      first_name: campaign_admin_membership.user.first_name,
      last_name: campaign_admin_membership.user.last_name,
      user_id: campaign_admin_membership.user_id,
      email: campaign_admin_membership.user.email,
      created_at: I18n.l(campaign_admin_membership.created_at, format: :short)
    )
  end
end
