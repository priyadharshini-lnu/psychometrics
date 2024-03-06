# frozen_string_literal: true

require 'rails_helper'

describe Hogan::StartAssessment do
  let(:assessment) { create(:assessment, type: 'Assessments::Hogan', dimension: nil) }
  let(:user_assessment) { create(:user_assessment, assessment: assessment, evaluator: user, subject: user) }
  let(:user) { create(:user) }
  let(:project) { create(:project) }

  it '.call' do
    expect(Services::Hogan::Api::Json::GroupDetails).to receive(:call).and_return(double('res', success?: true))
    expect(Services::Hogan::Api::Json::AddParticipantToGroup).to receive(:call!).
      and_return(double('res', participant_id: 1))
    expect(Services::Hogan::Api::Json::AddParticipantAssessment).to receive(:call!)

    response = Hogan::StartAssessment.call(user_assessment)

    expect(response).to eq({ ok: [] })
    expect(user.reload.hogan_credential).to be_truthy
  end
end
