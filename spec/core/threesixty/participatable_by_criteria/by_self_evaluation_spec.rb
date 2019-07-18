# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::ParticipatableByCriteria::BySelfEvaluation do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let(:threesixty_subjects) { create_list(:threesixty_subject, 3, campaign: threesixty_campaign.campaign) }

  context 'completed criteria' do
    it 'returns participatables who have completed self evaluation' do
      threesixty_subjects[0..1].each do |threesixty_subject|
        create(
          :users_result,
          campaign: threesixty_campaign.campaign,
          subject_id: threesixty_subject.user_id,
          evaluator_id: threesixty_subject.user_id,
          status: :completed
        )
      end

      criteria_list = [{ 'field' => 'self_evaluations', 'value' => 'completed'}]
      results = described_class.call!(
        threesixty_campaign: threesixty_campaign,
        participatables: threesixty_subjects,
        criteria_list: criteria_list
      )

      expect(results).to match_array(threesixty_subjects[0..1])
    end

    it "doesn't return participantables whose self evaluation is in progress" do
      create(
        :users_result,
        campaign: threesixty_campaign.campaign,
        subject_id: threesixty_subjects[0].user_id,
        evaluator_id: threesixty_subjects[0].user_id,
        status: :in_progress
      )

      criteria_list = [{ 'field' => 'self_evaluations', 'value' => 'completed'}]
      results = described_class.call!(
        threesixty_campaign: threesixty_campaign,
        participatables: threesixty_subjects,
        criteria_list: criteria_list
      )

      expect(results).to eq([])
    end
  end

  context 'not_completed criteria' do
    it "returns participatables who haven't completed self evaluation" do
      create(
        :users_result,
        campaign: threesixty_campaign.campaign,
        subject_id: threesixty_subjects[0].user_id,
        evaluator_id: threesixty_subjects[0].user_id,
        status: :completed
      )

      criteria_list = [{ 'field' => 'self_evaluations', 'value' => 'not_completed'}]
      results = described_class.call!(
        threesixty_campaign: threesixty_campaign,
        participatables: threesixty_subjects,
        criteria_list: criteria_list
      )

      expect(results).to match_array(threesixty_subjects[1..2])
    end
  end
end
