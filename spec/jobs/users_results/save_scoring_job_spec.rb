# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UsersResults::SaveScoringJob, type: :job do
  let(:user_result) { create(:users_result, answers: {}) }

  before do
    allow(UsersResults::CalculateScoring).to receive(:call!).and_return({})
  end

  it 'save the user result correctly' do
    allow(user_result).to receive(:completed?).and_return(true)
    allow(user_result.user_assessment).to receive(:update!)

    described_class.perform_now(user_result)

    expect(UsersResults::CalculateScoring).to have_received(:call!).with(user_result)

    expect(user_result.user_assessment).to have_received(:update!).with(score_calculated: true,
                                                                        score_calculated_at: Time.zone.now)
  end
end
