# frozen_string_literal: true

require 'rails_helper'

describe Licenses::IsUsedByUser do
  let(:user) { create(:user, project: create(:project)) }
  let(:report) { create(:report) }
  let(:license) { create(:license, client: create(:tenancy)) }

  it 'returns true if license for a report is used by a user' do
    allow_any_instance_of(Licenses::FetchQuery).to receive(:query).and_return([license])
    create(:license_usage, license: license, user: user)
    result = described_class.call!(user, report)

    expect(result).to eq(true)
  end

  it 'returns false if license for report is not used by user' do
    allow_any_instance_of(Licenses::FetchQuery).to receive(:query).and_return([license])
    result = described_class.call!(user, report)

    expect(result).to eq(false)
  end
end
