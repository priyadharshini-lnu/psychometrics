# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Participants::CalcCounters do
  let(:first_subject) { create(:threesixty_subject) }
  let(:second_subject) { create(:threesixty_subject) }

  describe '.call' do
    before do
      campaign = option_which_does_not_require_approval.threesixty_campaign.campaign
      create(:threesixty_participant,
             campaign: campaign, subject_id: second_subject.user_id, manager_nomination_status: :approved)
      create(:threesixty_participant,
             campaign: campaign, evaluator_id: second_subject.user_id, manager_nomination_status: :approved)
      create(:threesixty_participant,
             campaign: campaign, evaluator_id: first_subject.user_id, manager_nomination_status: :waiting)
      create(:users_result, campaign: campaign, subject_id: first_subject.user_id, status: :completed,
score_calculated: true)
      create(:users_result, campaign: campaign, subject_id: first_subject.user_id, status: :completed,
score_calculated: true)
    end

    let(:option_which_does_not_require_approval) do
      create(:threesixty_option, participants: { 'manager' => {}, 'subject' => { 'can_evaluate_self' => true } })
    end
    let(:subject) { create(:threesixty_subject, report_approval_status: :denied) }
    let(:args_array) { [first_subject.user_id, second_subject.user_id] }

    it do
      expect(described_class.call!(args_array, option_which_does_not_require_approval.threesixty_campaign)).to eq(
        first_subject.user_id => {
          total_evaluators: 2, total_evaluations: 1, completed_evaluations: 0, completed_evaluators: 2
        },
        second_subject.user_id => {
          total_evaluators: 1, total_evaluations: 1, completed_evaluations: 0, completed_evaluators: 0
        }
      )
    end
  end
end
