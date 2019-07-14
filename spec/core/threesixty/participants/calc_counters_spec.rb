require 'rails_helper'

describe Threesixty::Participants::CalcCounters do
  let(:subject_1) { create(:threesixty_subject) }
  let(:subject_2) { create(:threesixty_subject) }

  describe 'manager should approve evaluations' do
    let(:option_which_requires_approval) { create(:threesixty_option, participants: { "manager" => { "can_approves_evaluations" => true}, "subject" => {"can_evaluate_self" => true} }) }
    before do
      campaign = option_which_requires_approval.threesixty_campaign.campaign
      create(:participant, campaign: campaign, subject_id: subject_1.user_id, manager_nomination_status: :approved, manager_evaluation_status: :approved)
      create(:participant, subject_id: subject_1.user_id, manager_nomination_status: :approved, manager_evaluation_status: :approved)
      create(:participant, campaign: campaign, subject_id: subject_2.user_id, manager_nomination_status: :approved, manager_evaluation_status: :approved)
      create(:participant, campaign: campaign, evaluator_id: subject_2.user_id, manager_nomination_status: :approved, manager_evaluation_status: :approved)
      create(:participant, campaign: campaign, evaluator_id: subject_1.user_id, manager_nomination_status: :waiting)
      create(:participant, campaign: campaign, subject_id: subject_1.user_id, manager_nomination_status: :waiting)
    end
    let(:subject) { create(:threesixty_subject, report_approval_status: :denied) }

    it do
      expect(described_class.call!([subject_1.user_id, subject_2.user_id], option_which_requires_approval.threesixty_campaign)).to eq ({
        subject_1.user_id => { total_evaluators: 2, total_evaluations: 1, completed_evaluations: 0, completed_evaluators: 1 },
        subject_2.user_id => { total_evaluators: 1, total_evaluations: 1, completed_evaluations: 1, completed_evaluators: 1 }
      })
    end
  end

  describe 'manager should not approve evaluations' do
    let(:option_which_does_not_require_approval) { create(:threesixty_option, participants: { "manager" => {}, "subject" => {"can_evaluate_self" => true} }) }
    before do
      campaign = option_which_does_not_require_approval.threesixty_campaign.campaign
      create(:participant, campaign: campaign, subject_id: subject_1.user_id, manager_nomination_status: :approved)
      create(:participant, subject_id: subject_1.user_id, manager_nomination_status: :approved)
      create(:participant, campaign: campaign, subject_id: subject_2.user_id, manager_nomination_status: :approved)
      create(:participant, campaign: campaign, evaluator_id: subject_2.user_id, manager_nomination_status: :approved)
      create(:participant, campaign: campaign, evaluator_id: subject_1.user_id, manager_nomination_status: :waiting)
      create(:participant, campaign: campaign, subject_id: subject_1.user_id, manager_nomination_status: :waiting)
      create(:users_result, subject_id: subject_1.user_id, status: :completed)
      create(:users_result, subject_id: subject_1.user_id, status: :completed)
    end
    let(:subject) { create(:threesixty_subject, report_approval_status: :denied) }

    it do
      expect(described_class.call!([subject_1.user_id, subject_2.user_id], option_which_does_not_require_approval.threesixty_campaign)).to eq ({
        subject_1.user_id => { total_evaluators: 2, total_evaluations: 1, completed_evaluations: 0, completed_evaluators: 2 },
        subject_2.user_id => { total_evaluators: 1, total_evaluations: 1, completed_evaluations: 0, completed_evaluators: 0 }
      })
    end
  end
end
