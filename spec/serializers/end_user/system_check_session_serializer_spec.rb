# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EndUser::SystemCheckSessionSerializer do
  let(:user) { create(:user) }
  let(:system_check_session) { create(:system_check_session, user: user) }

  subject { described_class.new.serialize(system_check_session) }

  describe 'attributes' do
    it 'serializes main attributes correctly' do
      result = subject

      expect(result['id']).to eq(system_check_session.id)
      expect(result['user_id']).to eq(user.id)
      expect(result['created_at']).to be_present
      expect(result).to have_key('finished_at')
    end
  end

  describe '#in_progress' do
    context 'when session is in progress' do
      let(:system_check_session) { create(:system_check_session, :in_progress, user: user) }

      it 'returns true' do
        expect(subject['in_progress']).to be true
      end
    end

    context 'when session is completed' do
      let(:system_check_session) { create(:system_check_session, :completed, user: user) }

      it 'returns false' do
        expect(subject['in_progress']).to be false
      end
    end
  end

  describe '#completed' do
    context 'when session is completed' do
      let(:system_check_session) { create(:system_check_session, :completed, user: user) }

      it 'returns true' do
        expect(subject['completed']).to be true
      end
    end

    context 'when session is in progress' do
      let(:system_check_session) { create(:system_check_session, :in_progress, user: user) }

      it 'returns false' do
        expect(subject['completed']).to be false
      end
    end
  end
end
