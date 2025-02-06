# frozen_string_literal: true

require 'rails_helper'

describe Idp::AssignUserIdp do
  let!(:campaign) { create(:campaign) }
  let!(:user) { create(:user) }
  let!(:idp_template) { create(:idp_template, project: campaign.project) }
  let!(:idp_template2) { create(:idp_template, project: campaign.project) }
  let!(:campaign_user) { create(:campaign_user, user: user, campaign: campaign) }

  it 'assign new idp to user' do
    user_plan = described_class.call!(user, idp_template.id, campaign.id)
    expect(user_plan.active).to eq(true)
  end

  it 'assign multiple idp plans to user' do
    user_plan = described_class.call!(user, idp_template.id, campaign.id)
    user_plan2 = described_class.call!(user, idp_template2.id, campaign.id)
    expect(user.user_idp_plans.count).to eq(2)
    expect(user_plan.reload.active).to eq(false)
    expect(user_plan2.active).to eq(true)
  end

  it 'reassiging multiple idp plans should not create new idp plan' do
    described_class.call!(user, idp_template.id, campaign.id)
    user_plan2 = described_class.call!(user, idp_template2.id, campaign.id)
    user_plan = described_class.call!(user, idp_template.id, campaign.id)

    expect(user.user_idp_plans.count).to eq(2)
    expect(user_plan.reload.active).to eq(true)
    expect(user_plan2.reload.active).to eq(false)
  end

  # TODO: add spec to check license consumption
end
