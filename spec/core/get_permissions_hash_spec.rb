# frozen_string_literal: true

require 'rails_helper'

describe GetPermissionsHash do
  let(:current_user) { create(:superadmin) }
  let(:user_assessment) { create(:user_assessment) }

  it 'returns permissions hash by checking policies' do
    policy = Administration::UserAssessmentPolicy.new(current_user, user_assessment)

    result = described_class.call!(
      Administration::UserAssessmentPolicy,
      current_user,
      user_assessment,
      %w[update_additional_time]
    )

    expect(result).to eq({
      'update_additional_time' => policy.update_additional_time?
    })
  end
end
