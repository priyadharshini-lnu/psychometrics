# frozen_string_literal: true

require 'rails_helper'

describe Idp::AssignUserIdp do
  let!(:campaign) { create(:campaign) }
  let!(:user) { create(:user) }
  let!(:idp_template) { create(:idp_template, project: campaign.project) }
  let!(:idp_template2) { create(:idp_template, project: campaign.project) }
  let!(:campaign_user) { create(:campaign_user, user: user, campaign: campaign) }
  let!(:license) { create(:license, client: campaign.client, type: :idp) }

  it 'assign new idp to user' do
    user_plan = described_class.call!(user, idp_template.id, campaign.id)
    expect(user_plan.active).to eq(true)
    expect(LicenseUsage.count).to eq(1)
    expect(LicenseUsage.last.consumer).to eq(user_plan)
  end

  it 'assign multiple idp plans to user' do
    user_plan = described_class.call!(user, idp_template.id, campaign.id)
    user_plan2 = described_class.call!(user, idp_template2.id, campaign.id)
    expect(LicenseUsage.count).to eq(2)
    expect(user.user_idp_plans.count).to eq(2)
    expect(user_plan.reload.active).to eq(false)
    expect(user_plan2.active).to eq(true)
  end

  it 'reassiging multiple idp plans should not create new idp plan and not consume license' do
    described_class.call!(user, idp_template.id, campaign.id)
    user_plan2 = described_class.call!(user, idp_template2.id, campaign.id)
    user_plan = described_class.call!(user, idp_template.id, campaign.id)

    expect(user.user_idp_plans.count).to eq(2)
    expect(user_plan.reload.active).to eq(true)
    expect(user_plan2.reload.active).to eq(false)
    expect(LicenseUsage.count).to eq(2)
  end

  context 'assign_skill_gap_report_to_user' do
    let!(:report) { create(:report) }
    let!(:report_family) { create(:report_family, reports: [report]) }
    let!(:common_license) { create(:license, type: :common, client: campaign.client, report_family: report_family) }

    it 'creates user_report for the user if report is available to template' do
      idp_template.update!(report: report)

      described_class.call!(user, idp_template.id, campaign.id, user)

      user_report = UserReport.find_by(campaign: campaign, report: report, user: user)

      expect(user_report).to be_present
    end
  end

  it 'shoud raise error if not enought license' do
    license.update(used_number: 100)
    expect { described_class.call!(user, idp_template.id, campaign.id) }.to raise_error(Licenses::NotEnoughError)
    expect(LicenseUsage.count).to eq(0)
    expect(user.user_idp_plans.count).to eq(0)
  end
end
