# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Campaigns::CurrentUserSerializer do
  it 'includes support_admin reflecting the allowlist' do
    allow(Settings).to receive(:support_admins).and_return('me@example.com')
    user = create(:superadmin, email: 'me@example.com')

    json = described_class.new(context: { project_id: nil }).serialize(user).deep_stringify_keys

    expect(json).to have_key('support_admin')
    expect(json['support_admin']).to eq(true)
  end

  it 'is false when the user email is not in the allowlist' do
    allow(Settings).to receive(:support_admins).and_return('someone@example.com')
    user = create(:superadmin, email: 'not-listed@example.com')

    json = described_class.new(context: { project_id: nil }).serialize(user).deep_stringify_keys
    expect(json['support_admin']).to eq(false)
  end
end
