# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::EvaluatorParticipantsBySubject do
  describe '.call' do
    let(:subject) { create(:threesixty_subject) }
    let(:first_evaluator) { create(:user) }
    let(:second_evaluator) { create(:user) }
    let(:third_evaluator) { create(:user) }

    before do
      create(
        :threesixty_participant, campaign_id: subject.campaign_id, subject: subject.user, evaluator: first_evaluator
      )
      create(
        :threesixty_participant, campaign_id: subject.campaign_id, subject: subject.user, evaluator: second_evaluator
      )
      create(:threesixty_participant, campaign_id: subject.campaign_id, evaluator: third_evaluator)
    end

    it do
      results = described_class.new(subject.user_id, subject.campaign_id).query
      expect(results.map(&:evaluator_id)).to match_array [first_evaluator.id, second_evaluator.id]
    end
  end
end
