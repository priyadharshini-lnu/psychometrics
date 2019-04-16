# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::ParticipantSerializer do
  describe '#to_hash' do
    let(:campaign) { create(:campaign) }
    let(:relationship_manager) { create(:relationship, name: 'Manager') }
    let(:dustin) { create(:user, email: 'dustin@poirier.com') }
    let(:max) { create(:user, email: 'max@holloway.com') }
    let(:participant_max) { create(:participant, relationship: relationship_manager, subject: dustin, evaluator: max) }
    let(:participant_dustin) { create(:participant, relationship: relationship_manager, subject: dustin, evaluator: dustin) }
    let(:subject_map) do
      {
        1001 => build(:threesixty_subject, id: 1001, user: dustin, campaign: campaign),
      }
    end

    it do
      result = described_class.new(participant_max, subject_map: subject_map).to_hash
      expect(result[:is_subject]).to eq false
    end

    it do
      result = described_class.new(participant_dustin, subject_map: subject_map).to_hash
      expect(result[:is_subject]).to eq true
    end
  end
end
