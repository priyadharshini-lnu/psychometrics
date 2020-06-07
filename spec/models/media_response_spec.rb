# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MediaResponse, type: :model do
  let!(:tenancy) { create(:tenancy) }
  let!(:license) { create(:license, client: tenancy, used_number: 0) }

  it "doesn't allow media_responses more than max_takes specified in the question" do
    question = create(:question, props: { 'maxTakes' => 2 }, type: 'VideoResponse')
    media_response = create(:media_response, question: question)
    expect(media_response.persisted?).to eq(true)

    media_response = create(:media_response, question: question, assign: media_response.assign)
    expect(media_response.persisted?).to eq(true)

    media_response = build(:media_response, question: question, assign: media_response.assign)
    expect(media_response.valid?).to eq(false)
    expect(media_response.errors[:base]).to include('Limit reached for maximum takes')
  end

  it "maxTakes of one question doesn't effect other question" do
    question1 = create(:question, props: { 'maxTakes' => 1 }, type: 'VideoResponse')
    media_response1 = create(:media_response, question: question1)

    question2 = create(:question, type: 'VideoResponse')
    media_response2 = create(:media_response, question: question2, assign: media_response1.assign)
    expect(media_response2.persisted?).to eq(true)
  end
end
