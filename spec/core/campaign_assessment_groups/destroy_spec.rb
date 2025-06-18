# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CampaignAssessmentGroups::Destroy do
  let(:campaign) { create(:campaign) }
  let(:group) { create(:campaign_assessment_group, campaign: campaign) }

  subject(:destroy_group) { described_class.new(campaign, group) }

  describe '#call' do
    context 'when group has workshops' do
      let!(:workshop) { create(:workshop, campaign_assessment_group: group) }

      it 'broadcasts error' do
        expect { destroy_group.call }.
          to broadcast(:error, I18n.t('assessments_reports.sequencing.modal.delete.cannot_delete_with_workshops'))
      end

      it 'does not destroy the group' do
        expect { destroy_group.call }.not_to change(CampaignAssessmentGroup, :count)
      end
    end
    context 'when destroying a regular group' do
      let!(:ungrouped_assessment1) { create(:campaign_assessment, campaign: campaign, position: 1) }
      let!(:campaign_assessment1) do
        create(:campaign_assessment, campaign: campaign, campaign_assessment_group: group, position: 2)
      end
      let!(:campaign_assessment2) do
        create(:campaign_assessment, campaign: campaign, campaign_assessment_group: group, position: 3)
      end

      it 'moves assessments after existing ungrouped assessments' do
        expect { destroy_group.call }.to(
          change { campaign_assessment1.reload.campaign_assessment_group_id }.to(nil).
          and(change { campaign_assessment2.reload.campaign_assessment_group_id }.to(nil)).
          and(change { campaign_assessment1.reload.position }.to(2)).
          and(change { campaign_assessment2.reload.position }.to(3))
        )
      end

      it 'destroys the group' do
        expect { destroy_group.call }.to change(CampaignAssessmentGroup, :count).by(-1)
      end
    end

    context 'when destroying an assessment center group' do
      let(:group) { create(:campaign_assessment_group, :assessment_center, campaign: campaign) }
      let!(:campaign_assessment) do
        create(:campaign_assessment,
               campaign: campaign,
               campaign_assessment_group: group,
               workshop_activity: true,
               workshop_activity_duration: 30)
      end

      it 'resets workshop activity settings' do
        expect { destroy_group.call }.to(
          change { campaign_assessment.reload.workshop_activity }.to(false).
          and(change { campaign_assessment.reload.workshop_activity_duration }.to(nil))
        )
      end

      it 'destroys the group' do
        expect { destroy_group.call }.to change(CampaignAssessmentGroup, :count).by(-1)
      end

      it 'broadcasts :ok' do
        expect { destroy_group.call }.to broadcast(:ok)
      end
    end

    context 'when there are no existing ungrouped assessments' do
      let!(:campaign_assessment) do
        create(:campaign_assessment, campaign: campaign, campaign_assessment_group: group, position: 1)
      end

      it 'starts position from 1' do
        destroy_group.call
        expect(campaign_assessment.reload.position).to eq(1)
      end

      it 'broadcasts :ok' do
        expect { destroy_group.call }.to broadcast(:ok)
      end
    end
  end
end
