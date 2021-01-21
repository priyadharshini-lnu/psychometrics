# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::EvaluatorParticipantsBySubject do
  describe '.call' do
    let(:subject) { create(:threesixty_subject) }
    let(:evaluator_1) { create(:user) }
    let(:evaluator_2) { create(:user) }
    let(:evaluator_3) { create(:user) }

    before do
      create(:threesixty_participant, campaign_id: subject.campaign_id, subject: subject.user, evaluator: evaluator_1)
      create(:threesixty_participant, campaign_id: subject.campaign_id, subject: subject.user, evaluator: evaluator_2)
      create(:threesixty_participant, campaign_id: subject.campaign_id, evaluator: evaluator_3)
    end

    it do
      results = described_class.new(subject.user_id, subject.campaign_id).query
      expect(results.map(&:evaluator_id)).to match_array [evaluator_1.id, evaluator_2.id]
    end
  end
end
