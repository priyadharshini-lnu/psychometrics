# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::CampaignAssessmentPolicy do
  let(:project_id) { 10 }
  let(:campaign_id) { 20 }

  describe '#bulk_export_raw_factor_scores?' do
    it 'allows superadmin' do
      policy = described_class.new(create(:superadmin), CampaignAssessment,
                                   project_id: project_id, campaign_id: campaign_id)

      expect(policy.bulk_export_raw_factor_scores?).to be true
    end

    it 'allows user with scores permission' do
      user = create(:user)
      allow(user).to receive(:has_permission?).with(
        :results, :scores, project_id: project_id, campaign_id: campaign_id
      ).and_return(true)

      policy = described_class.new(user, CampaignAssessment,
                                   project_id: project_id, campaign_id: campaign_id)

      expect(policy.bulk_export_raw_factor_scores?).to be true
    end

    it 'denies user without scores permission' do
      user = create(:user)
      allow(user).to receive(:has_permission?).and_return(false)

      policy = described_class.new(user, CampaignAssessment,
                                   project_id: project_id, campaign_id: campaign_id)

      expect(policy.bulk_export_raw_factor_scores?).to be false
    end
  end

  describe '#bulk_export_norm_factor_scores?' do
    it 'allows user with scores permission' do
      user = create(:user)
      allow(user).to receive(:has_permission?).with(
        :results, :scores, project_id: project_id, campaign_id: campaign_id
      ).and_return(true)

      policy = described_class.new(user, CampaignAssessment,
                                   project_id: project_id, campaign_id: campaign_id)

      expect(policy.bulk_export_norm_factor_scores?).to be true
    end

    it 'denies user without scores permission' do
      user = create(:user)
      allow(user).to receive(:has_permission?).and_return(false)

      policy = described_class.new(user, CampaignAssessment,
                                   project_id: project_id, campaign_id: campaign_id)

      expect(policy.bulk_export_norm_factor_scores?).to be false
    end
  end

  describe '#update_occupation_condition_set?' do
    it 'allows superadmin' do
      policy = described_class.new(create(:superadmin), CampaignAssessment,
                                   project_id: project_id, campaign_id: campaign_id)

      expect(policy.update_occupation_condition_set?).to be true
    end

    it 'denies non-superadmin' do
      user = create(:user)
      policy = described_class.new(user, CampaignAssessment,
                                   project_id: project_id, campaign_id: campaign_id)

      expect(policy.update_occupation_condition_set?).to be false
    end
  end
end
