# frozen_string_literal: true

require 'rails_helper'

describe Users::GetCustomProfileFields do
  it 'gets custom profile field with value in the predefined field order' do
    question1 = create(:question, props: { questionText: 'Q1' })
    question2 = create(:question, props: { questionText: 'Q2' })

    user = create(:user, :with_project_membership)
    profile_setting = user.project.profile_setting
    f1 = create(:profile_field, profile_setting: profile_setting, question: question1, position: 2)
    f2 = create(:profile_field, profile_setting: profile_setting, question: question2, position: 1)
    create(:profile_field_value, profile_field: f1, user_profile: user.user_profile, string_value: 'Q1 Answer')
    create(:profile_field_value, profile_field: f2, user_profile: user.user_profile, string_value: 'Q2 Answer')

    result = described_class.call!(user)

    expect(result).to eq([
      { name: 'Q2', value: 'Q2 Answer' },
      { name: 'Q1', value: 'Q1 Answer' }
    ])
  end
end
