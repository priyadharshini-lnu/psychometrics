# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MediaResponse, type: :model do
  let!(:tenancy) { create(:tenancy) }
  let!(:license) { create(:license, client: tenancy, used_number: 0) }
  let!(:assessment) { create(:assessment, type: Assessments::Common) }
  let!(:block) { create(:block, assessment: assessment) }
  let!(:question) { create(:question, assessment: assessment, block: block) }
  let!(:users_result) { create(:users_result) }

  it "doesn't allow media_responses more than max_takes specified in the question" do
    question = create(:question, assessment: assessment, props: { 'maxTakes' => 2 }, type: 'VideoResponse')
    media_response = create(:media_response, question: question, users_result: users_result)
    expect(media_response.persisted?).to eq(true)

    media_response = create(
      :media_response, question: question, users_result: users_result
    )
    expect(media_response.persisted?).to eq(true)

    media_response = build(
      :media_response, question: question, users_result: users_result
    )
    expect { media_response.save! }.to raise_error(
      ActiveRecord::RecordInvalid, 'Validation failed: Limit reached for maximum takes'
    )
  end

  it "maxTakes of one question doesn't effect other question" do
    question1 = create(:question, assessment: assessment, props: { 'maxTakes' => 1 }, type: 'VideoResponse')
    create(:media_response, question: question1, users_result: users_result)

    question2 = create(:question, type: 'VideoResponse', assessment: assessment)
    media_response2 = create(
      :media_response, question: question2, users_result: users_result
    )
    expect(media_response2.persisted?).to eq(true)
  end

  it 'prevents non existing questions' do
    media_response = create(:media_response, question: question)

    expect { media_response.question.delete }.to raise_error(ActiveRecord::InvalidForeignKey)
  end

  it 'deletes record if related :users_result is deleted' do
    media_response = create(:media_response, question: question)

    expect { media_response.users_result.delete }.to change(described_class, :count).by(-1)
  end
end
