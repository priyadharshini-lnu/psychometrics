# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProctoringSessions::MarkInvalid do
  let(:proctoring_session) { create(:proctoring_session) }
  let(:license) { create(:license) }
  let!(:license_usage) do
    create(
      :license_usage, proctoring_session_id: proctoring_session.id, proctoring_credits_debited: 5, license: license
    )
  end

  it 'marks proctoring_session as invalid' do
    described_class.call!(proctoring_session)

    expect(proctoring_session.invalid_session).to eq(true)
  end

  it 'credits back the deducted credit' do
    license.update(used_number: 100)
    described_class.call!(proctoring_session)

    expect(license.reload.used_number).to eq(95)
  end
end
