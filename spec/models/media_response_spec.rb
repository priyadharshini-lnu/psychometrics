# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MediaResponse, type: :model do
  let!(:tenancy) { create(:tenancy) }
  let!(:license) { create(:license, client: tenancy, used_number: 0) }
  let(:users_result) { create(:users_result) }

  it "doesn't allow media_responses more than max_takes specified in the question" do
    question = create(:question, props: { 'maxTakes' => 2 }, type: 'VideoResponse')
    media_response = create(:media_response, question: question, users_result: users_result)
    expect(media_response.persisted?).to eq(true)

    media_response = create(
      :media_response, question: question, assign: media_response.assign, users_result: users_result
    )
    expect(media_response.persisted?).to eq(true)

    media_response = build(
      :media_response, question: question, assign: media_response.assign, users_result: users_result
    )
    expect { media_response.save! }.to raise_error(
      ActiveRecord::RecordInvalid, 'Validation failed: Limit reached for maximum takes'
    )
  end

  it "maxTakes of one question doesn't effect other question" do
    question1 = create(:question, props: { 'maxTakes' => 1 }, type: 'VideoResponse')
    media_response1 = create(:media_response, question: question1, users_result: users_result)

    question2 = create(:question, type: 'VideoResponse')
    media_response2 = create(
      :media_response, question: question2, assign: media_response1.assign, users_result: users_result
    )
    expect(media_response2.persisted?).to eq(true)
  end

  it 'prevents non existing questions' do
    media_response = create(:media_response)

    expect { media_response.question.delete }.to raise_error(ActiveRecord::InvalidForeignKey)
  end

  it 'deletes record if related :users_result is deleted' do
    media_response = create(:media_response)

    expect { media_response.users_result.delete }.to change(described_class, :count).by(-1)
  end
end
