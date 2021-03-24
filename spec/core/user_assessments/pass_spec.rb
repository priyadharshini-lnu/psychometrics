# frozen_string_literal: true

require 'rails_helper'

describe UserAssessments::Pass do
  let(:user_assessment) do
    create(
      :user_assessment,
      users_result: build(:users_result, additional_time: 20), assessment: build(:assessment, extra: { timer: 10 })
    )
  end

  it 'status = not_started' do
    user_assessment.status = 'not_started'
    described_class.call!(user_assessment, 'ru')

    expect(user_assessment.status).to eq('in_progress')
    expect(user_assessment.users_result.selected_locale).to eq('ru')
    expect(user_assessment.users_result.expiry_date).to eq(10.second.from_now)
  end

  it 'status = interrupted' do
    user_assessment.status = 'interrupted'
    described_class.call!(user_assessment, nil)

    expect(user_assessment.status).to eq('in_progress')
    expect(user_assessment.users_result.selected_locale).to be_nil
    expect(user_assessment.users_result.expiry_date).to eq(20.second.from_now)
  end

  it 'status = completed' do
    user_assessment.status = 'completed'
    described_class.call!(user_assessment, nil)

    expect(user_assessment.users_result.status).to eq('completed')
    expect(user_assessment.users_result.selected_locale).to be_nil
    expect(user_assessment.users_result.expiry_date).to be_nil
  end
end
