# frozen_string_literal: true

require 'rails_helper'

describe Users::GetCustomProfileFields do
  it 'gets custom profile field with value in the predefined field order' do
    question1 = create(:question, props: { questionText: 'Q1' })
    question2 = create(:question, props: { questionText: 'Q2' })

    user = create(:user, :with_project_membership)
    profile_setting = user.project.profile_setting
    create(:profile_field, profile_setting: profile_setting, question: question1, position: 2)
    create(:profile_field, profile_setting: profile_setting, question: question2, position: 1)

    custom_fields = {}
    custom_fields[question1.id.to_s] = 'Q1 Answer'
    custom_fields[question2.id.to_s] = 'Q2 Answer'
    user.user_profile.update(custom_fields: custom_fields)

    result = described_class.call!(user)

    expect(result).to eq([
      { name: 'Q2', value: 'Q2 Answer' },
      { name: 'Q1', value: 'Q1 Answer'}
    ])
  end
end
