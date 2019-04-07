require 'rails_helper'

describe Threesixty::EvaluatorParticipantsBySubject do

  describe '.call' do
    let(:subject) { create(:threesixty_subject) }
    let(:evaluator_1) { create(:campaigns_user) }
    let(:evaluator_2) { create(:campaigns_user) }
    let(:evaluator_3) { create(:campaigns_user) }

    before do
      create(:participant, subject: subject.campaigns_user, evaluator: evaluator_1)
      create(:participant, subject: subject.campaigns_user, evaluator: evaluator_2)
      create(:participant, evaluator: evaluator_3)
    end

    it do
      results = described_class.new(subject).query
      expect(results.map(&:evaluator_id)).to match_array [evaluator_1.id, evaluator_2.id]
    end
  end
end
