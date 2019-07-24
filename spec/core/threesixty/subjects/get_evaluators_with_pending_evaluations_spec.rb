# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Subjects::GetEvaluatorsWithPendingEvaluations do
  before do
    @threesixty_campaign = create(:threesixty_campaign)
    @subject = create(:threesixty_subject, campaign_id: @threesixty_campaign.campaign_id)
    @evaluators = create_list(:threesixty_evaluator, 4, campaign_id: @threesixty_campaign.campaign_id)

    # Approved participant with completed evaluation
    create(
      :threesixty_participant,
      subject_id: @subject.user_id,
      campaign_id: @threesixty_campaign.campaign_id,
      evaluator_id: @evaluators[0].user_id,
      manager_nomination_status: :approved
    )
    create(
      :users_result,
      campaign_id: @threesixty_campaign.campaign_id,
      subject_id: @subject.user_id,
      evaluator_id: @evaluators[0].user_id,
      status: :completed
    )

    # Approved participant with no evaluation
    create(
      :threesixty_participant,
      subject_id: @subject.user_id,
      campaign_id: @threesixty_campaign.campaign_id,
      evaluator_id: @evaluators[1].user_id,
      manager_nomination_status: :approved
    )

    # Approved participant with incompleted evaluation
    create(
      :threesixty_participant,
      subject_id: @subject.user_id,
      campaign_id: @threesixty_campaign.campaign_id,
      evaluator_id: @evaluators[2].user_id,
      manager_nomination_status: :approved
    )
    create(
      :users_result,
      campaign_id: @threesixty_campaign.campaign_id,
      subject_id: @subject.user_id,
      evaluator_id: @evaluators[2].user_id,
      status: :in_progress
    )

    # Participant in waiting state with no evaluation
    create(
      :threesixty_participant,
      subject_id: @subject.user_id,
      campaign_id: @threesixty_campaign.campaign_id,
      evaluator: @evaluators[3].user,
      manager_nomination_status: :waiting
    )
  end

  context 'manager can approve evaluations' do
    it "gets approved evaluators who haven't completed evaulations yet" do
      create(
        :threesixty_option,
        threesixty_campaign: @threesixty_campaign,
        participants: { "manager" => { "can_approve_nominations" => true } }
      )
      actual_result = described_class.new(threesixty_campaign: @threesixty_campaign, subject: @subject).to_a

      expect(actual_result.length).to eq(2)
      expect(actual_result).to match_array(@evaluators[1..2])
    end
  end

  context "manager can't approve evaluations" do
    it "gets all evaluators who haven't completed evaulations yet" do
      create(
        :threesixty_option,
        threesixty_campaign: @threesixty_campaign,
        participants: { "manager" => { "can_approve_nominations" => false } }
      )
      actual_result = described_class.new(threesixty_campaign: @threesixty_campaign, subject: @subject).to_a

      expect(actual_result.length).to eq(3)
      expect(actual_result).to match_array(@evaluators[1..3])
    end
  end
end
