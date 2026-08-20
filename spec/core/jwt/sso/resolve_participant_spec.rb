# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Jwt::Sso::ResolveParticipant do
  subject(:call_service) { described_class.call(subject: subject_value) }

  let(:project) { create(:project) }
  let(:participant) { create(:user, project: project) }
  let(:subject_value) { participant.id.to_s }

  before { Current.project = project }

  describe '.call' do
    it 'returns the participant for a valid numeric subject' do
      expect(call_service[:ok]).to eq(participant)
    end

    it 'returns participant_not_found when subject is blank' do
      expect(described_class.call(subject: nil)[:error]).to eq(:participant_not_found)
    end

    it 'returns participant_not_found when participant does not exist in the project' do
      expect(described_class.call(subject: '-1')[:error]).to eq(:participant_not_found)
    end

    it 'returns participant_disabled when participant is disabled' do
      participant.update!(disabled: true)

      expect(call_service[:error]).to eq(:participant_disabled)
    end

    it 'returns the participant when subject is an email address' do
      expect(described_class.call(subject: participant.email)[:ok]).to eq(participant)
    end

    it 'returns participant_not_found when email belongs to a different project' do
      other_project = create(:project)
      other_user = create(:user, project: other_project)

      expect(described_class.call(subject: other_user.email)[:error]).to eq(:participant_not_found)
    end
  end
end
