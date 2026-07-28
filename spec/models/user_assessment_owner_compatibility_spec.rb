# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserAssessment, type: :model do
  describe 'owner compatibility between campaign and assessment' do
    let(:owner_mismatch_message) do
      I18n.t('admin.owner_resource_mismatch',
             child_resource: I18n.t('admin.owner_resource_assessment'),
             parent_resource: I18n.t('admin.owner_resource_campaign'))
    end

    let(:campaign) { create(:campaign) }
    let(:campaign_owner) { campaign.project.parent }
    let(:other_owner) { create(:tenancy, with_license: false) }
    let(:evaluator) { create(:user) }
    let(:subject) { create(:user) }

    it 'is valid when assessment owner matches campaign owner' do
      assessment = create(:assessment, owner: campaign_owner)
      record = build(:user_assessment, campaign: campaign, assessment: assessment, evaluator: evaluator,
subject: subject)

      expect(record).to be_valid
    end

    it 'is invalid when assessment owner does not match campaign owner' do
      assessment = create(:assessment, owner: other_owner)
      record = build(:user_assessment, campaign: campaign, assessment: assessment, evaluator: evaluator,
subject: subject)

      expect(record).not_to be_valid
      expect(record.errors[:assessment_id]).to include(owner_mismatch_message)
    end
  end
end
