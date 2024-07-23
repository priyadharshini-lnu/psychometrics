# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Saville::HandleErrorCode do
  describe '#call' do
    let(:user_assessment) do
      create(:user_assessment, saville_user_assessment: build(:saville_user_assessment))
    end
    let(:error_code) { '14' }
    let(:service) { described_class.new(error_code, user_assessment) }

    context 'when error code is ALREADY_STARTED_ERROR_CODE' do
      it 'updates the user assessment status to timed_out' do
        service.call
        expect(user_assessment.reload.status).to eq('timed_out')
        expect(user_assessment.reload.completion_reason).to eq('time_out_offline')
        expect(user_assessment.saville_user_assessment.error_code).to eq('14')
      end
    end

    context 'when error code is not ALREADY_STARTED_ERROR_CODE' do
      let(:error_code) { '0' }

      it 'does not update the user assessment status' do
        service.call

        expect(user_assessment.reload.status).to eq('not_started')
        expect(user_assessment.saville_user_assessment.error_code).to eq('0')
      end
    end
  end
end
