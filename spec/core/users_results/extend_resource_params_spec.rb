# frozen_string_literal: true

require 'rails_helper'

describe UsersResults::ExtendResourceParams do
  let(:users_result) do
    create(:users_result,
           status: 'in_progress',
           answers: {
             '1' => { 'answers' => [], 'question_id' => 1, 'not_applicable' => true, 'duration' => 1234 },
             '3' => { 'answers' => [], 'question_id' => 3, 'not_applicable' => true, 'duration' => 12_345 }
           })
  end
  let(:user_assessment) do
    users_result.user_assessment.update(last_activity_at: Time.zone.local(2019, 10, 8, 0, 0, 0))
    users_result.user_assessment
  end

  let(:resource_params) do
    {
      'answers' => {
        '1' => { 'answers' => [], 'question_id' => 1, 'not_applicable' => true },
        '2' => { 'answers' => [{ 'index' => 1, 'value' => 0 }], 'question_id' => 2, 'not_applicable' => nil }
      },
      'step' => 1,
      status: 'in_progress'
    }
  end

  it 'question_ids exist' do
    allow(Time).to receive(:current).and_return(Time.zone.local(2019, 10, 8, 0, 1, 15))
    expect(UsersResults::ExtendResourceParams.call!(resource_params, [1, 2], user_assessment)).to eq(
      'answers' => {
        '1' => { 'answers' => [], 'question_id' => 1, 'not_applicable' => true, 'duration' => 37_500,
                 'dirty' => false },
        '2' => {
          'answers' => [{ 'index' => 1, 'value' => 0 }],
          'question_id' => 2,
          'not_applicable' => nil,
          'duration' => 37_500,
          'dirty' => false
        },
        '3' => { 'answers' => [], 'question_id' => 3, 'not_applicable' => true, 'duration' => 12_345 }
      },
      'step' => 1,
      'last_activity_at' => Time.zone.local(2019, 10, 8, 0, 1, 15),
      status: 'in_progress'
    )
  end

  it 'question_ids exist and result is expired' do
    allow(Time).to receive(:current).and_return(Time.zone.local(2019, 10, 8, 0, 1, 15))
    users_result.user_assessment.update!(expiry_date: 1.minute.ago)
    expect(UsersResults::ExtendResourceParams.call!(resource_params, [1, 2], user_assessment)).to eq(
      'answers' => {
        '1' => { 'answers' => [], 'question_id' => 1, 'not_applicable' => true, 'duration' => 37_500,
                 'dirty' => false },
        '2' => {
          'answers' => [{ 'index' => 1, 'value' => 0 }],
          'question_id' => 2,
          'not_applicable' => nil,
          'duration' => 37_500,
          'dirty' => false
        },
        '3' => { 'answers' => [], 'question_id' => 3, 'not_applicable' => true, 'duration' => 12_345 }
      },
      'step' => 1,
      'last_activity_at' => Time.zone.local(2019, 10, 8, 0, 1, 15),
      status: 'completed',
      completion_reason: :time_out_online
    )
  end

  it 'question_ids not exist' do
    allow(Time).to receive(:current).and_return(Time.zone.local(2019, 10, 8, 0, 1, 15))
    expect(UsersResults::ExtendResourceParams.call!(resource_params, nil, user_assessment)).to eq(
      'answers' => {
        '1' => { 'answers' => [], 'question_id' => 1, 'not_applicable' => true, 'duration' => 1234 },
        '2' => { 'answers' => [{ 'index' => 1, 'value' => 0 }], 'question_id' => 2, 'not_applicable' => nil },
        '3' => { 'answers' => [], 'question_id' => 3, 'not_applicable' => true, 'duration' => 12_345 }
      },
      'step' => 1,
      'last_activity_at' => Time.zone.local(2019, 10, 8, 0, 1, 15),
      status: 'in_progress'
    )
  end

  it 'blank resource_params' do
    allow(Time).to receive(:current).and_return(Time.zone.local(2019, 10, 8, 0, 1, 15))
    expect(UsersResults::ExtendResourceParams.call!({}, nil, user_assessment)).to eq(
      'last_activity_at' => Time.zone.local(2019, 10, 8, 0, 1, 15),
      status: nil
    )
  end
end
