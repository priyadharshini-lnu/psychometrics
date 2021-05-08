# frozen_string_literal: true

require 'rails_helper'

describe Api::V1::Campaigns::AttachToUserForm do
  let(:campaign) { create(:campaign, project: project) }
  let(:user) { create(:user, project: project) }
  let(:project) { create(:project) }
  let(:attributes) { { campaigns: 1, operation: 'skip_existing' } }

  it 'validates campaign "active" field' do
    form = described_class.new({ campaigns: [{ id: campaign.id, existing_record: 'add_with_existing_response' }] }).
           with_context(project: project, user: user)

    expect(form.valid?).to eq(false)
    expect(form.errors[:campaigns]).to include('[Campaign 1] ["Active is not included in the list"]')
  end

  it 'validates campaign "active" field' do
    form = described_class.new({ campaigns: [{ id: campaign.id, existing_record: 'add_with_existing_response' }] }).
           with_context(project: project, user: user)

    expect(form.valid?).to eq(false)
    expect(form.errors[:campaigns]).to include('[Campaign 1] ["Active is not included in the list"]')
  end

  it 'validates campaigns' do
    form = described_class.new({ campaigns: [] }).with_context(project: project, user: user)

    expect(form.valid?).to eq(false)
    expect(form.errors[:campaigns]).to include('Should be at least one campaign')
  end

  it 'validates passes if valid attributes are passed' do
    form = described_class.new({ campaigns: [{
      id: campaign.id,
      active: false,
      existing_record: 'add_with_existing_response'
    }] }).with_context(project: project, user: user)

    expect(form.valid?).to eq(true)
  end
end
