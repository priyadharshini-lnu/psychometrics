# frozen_string_literal: true

require 'rails_helper'

describe Hogan::CreateHoganParticipant do
  let(:project) { create(:project) }
  let(:user) { create(:user, project: project) }

  let(:add_hogan_participant) { described_class.new(user) }

  describe '#call' do
    before(:each) do
      expect(Services::Hogan::Api::Json::GroupDetails).to receive(:call).and_return(double('res', success?: true))
      expect(Services::Hogan::Api::Json::AddParticipantToGroup).to receive(:call!).
        and_return(1)
    end

    it 'creates hogan credentials' do
      add_hogan_participant.call

      hogan_credential = user.reload.hogan_credential

      expect(hogan_credential.participant_id).to eq('1')
      expect(hogan_credential.provider).to eq('phoenix')
      expect(hogan_credential.norm).to eq('Global2023')
    end
  end
end
