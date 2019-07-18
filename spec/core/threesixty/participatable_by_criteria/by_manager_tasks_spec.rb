# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::ParticipatableByCriteria::ByManagerTasks do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let!(:threesixty_option) { create(:threesixty_option, threesixty_campaign: threesixty_campaign) }
  let(:threesixty_subjects) { create_list(:threesixty_subject, 3, campaign: threesixty_campaign.campaign) }
  let(:manager_relationship) { create(:relationship, name: 'Manager', type: :global) }

  context 'not_approved_all_nominations criteria' do
    it 'returns participatables who have not approved all nominations' do
      create(
        :participant,
        campaign_id: threesixty_campaign.campaign_id,
        subject_id: threesixty_subjects[0].user_id,
        evaluator_id: threesixty_subjects[1].user_id,
        relationship: manager_relationship,
        manager_nomination_status: :waiting
      )
      create(
        :participant,
        campaign_id: threesixty_campaign.campaign_id,
        subject_id: threesixty_subjects[1].user_id,
        evaluator_id: threesixty_subjects[2].user_id,
        relationship: manager_relationship,
        manager_nomination_status: :waiting
      )

      criteria_list = [{ 'field' => 'manager_tasks', 'value' => 'not_approved_all_nominations' }]
      results = described_class.call!(
        threesixty_campaign: threesixty_campaign,
        participatables: threesixty_subjects,
        criteria_list: criteria_list
      )

      expect(results).to match_array(threesixty_subjects[1..2])
    end
  end

  context 'not_approved_all_reports criteria' do
    it 'returns participatables who have not approved all reports' do
      create(
        :participant,
        campaign_id: threesixty_campaign.campaign_id,
        subject_id: threesixty_subjects[0].user_id,
        evaluator_id: threesixty_subjects[1].user_id,
        relationship: manager_relationship,
        manager_evaluation_status: :waiting
      )
      create(
        :participant,
        campaign_id: threesixty_campaign.campaign_id,
        subject_id: threesixty_subjects[1].user_id,
        evaluator_id: threesixty_subjects[2].user_id,
        relationship: manager_relationship,
        manager_evaluation_status: :waiting
      )

      criteria_list = [{ 'field' => 'manager_tasks', 'value' => 'not_approved_all_reports' }]
      results = described_class.call!(
        threesixty_campaign: threesixty_campaign,
        participatables: threesixty_subjects,
        criteria_list: criteria_list
      )

      expect(results).to match_array(threesixty_subjects[1..2])
    end
  end
end
