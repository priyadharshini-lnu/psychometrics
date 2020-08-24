# frozen_string_literal: true

require 'rails_helper'

describe Hogan::StartAssessment do
  let(:assessment) { create(:assessment, type: 'Assessments::Hogan', dimension: nil) }
  let(:user_result) { build(:users_result, assessment: assessment, evaluator: user) }
  let(:user) { create(:user) }
  let(:project) { create(:project) }

  it '.call' do
    expect(Hogan::AddReports).to receive(:call!)
    response = Hogan::StartAssessment.call(user_result, user.hogan_credential, project)
    expect(response).to eq({ ok: [] })
  end
end
