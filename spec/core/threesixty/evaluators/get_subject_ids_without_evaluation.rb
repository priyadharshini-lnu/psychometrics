# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Evaluators::GetSubjectIdsWithoutEvaluation do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let!(:threesixty_option) { create(:threesixty_option, threesixty_campaign: threesixty_campaign) }
  let(:campaign) { threesixty_campaign.campaign }
  let(:threesixty_evaluator) { create(:threesixty_evaluator, campaign: threesixty_campaign.campaign) }
  let(:threesixty_subject) { create(:threesixty_subject, campaign: threesixty_campaign.campaign) }

  it 'returns subject ids whose evaluations user has not completed' do
    threesixty_subjects = create_list(:threesixty_subject, 2, campaign: threesixty_campaign.campaign)

    threesixty_subjects.each do |subject|
      create(
        :threesixty_participant,
        campaign: campaign,
        subject: subject.user,
        evaluator: threesixty_evaluator.user,
        manager_evaluation_status: :approved
      )
    end

    subject_ids = described_class.call!(threesixty_campaign, threesixty_evaluator.user)

    expect(subject_ids).to eq(threesixty_subjects.map(&:user_id))
  end

  it "doesn't return subject if evaluator has declined to evaluate" do
    create(
      :threesixty_participant,
      campaign: campaign,
      subject: threesixty_subject.user,
      evaluator: threesixty_evaluator.user,
      evaluator_nomination_status: :declined,
      manager_evaluation_status: :approved
    )

    subject_ids = described_class.call!(threesixty_campaign, threesixty_evaluator.user)

    expect(subject_ids).to eq([])
  end

  it "doesn't return subject if evaluator cannot evaluator subject due to unapproved nomination" do
    threesixty_option.update(participants: { 'manager' => { 'can_approve_nominations' => true } })
    create(
      :threesixty_participant,
      campaign: campaign,
      subject: threesixty_subject.user,
      evaluator: threesixty_evaluator.user,
      manager_evaluation_status: :waiting
    )

    subject_ids = described_class.call!(threesixty_campaign, threesixty_evaluator.user)

    expect(subject_ids).to eq([])
  end

  it "if manager can't approve nomination return all subject irrespective on manager nomination status" do
    create(
      :threesixty_participant,
      campaign: campaign,
      subject: threesixty_subject.user,
      evaluator: threesixty_evaluator.user,
      manager_evaluation_status: :waiting
    )

    subject_ids = described_class.call!(threesixty_campaign, threesixty_evaluator.user)

    expect(subject_ids).to eq([threesixty_subject.user_id])
  end
end
