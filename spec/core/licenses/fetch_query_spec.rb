# frozen_string_literal: true

require 'rails_helper'

describe Licenses::FetchQuery do
  let(:client) { create(:tenancy) }
  let(:report_family) { create(:report_family) }
  let(:license) { create(:license, client: client, report_family: report_family, disabled: false) }

  it 'gets license if present for report' do
    licenses = described_class.new(client, report_family.id).query

    expect(licenses).to include(license)
  end

  it 'return licenses ordered by end_date' do
    license2 = create(:license, client: client, report_family: report_family,
      end_date: license.end_date.advance(days: -1))
    licenses = described_class.new(client, report_family.id).query

    expect(licenses.first).to eq(license2)
    expect(licenses.last).to eq(license)
  end

  it "doesn't return disabled license" do
    license.update(disabled: true)
    licenses = described_class.new(client, report_family.id).query

    expect(licenses).to be_empty
  end

  it "doesn't get license if license is not present from the report" do
    licenses = described_class.new(client, create(:report_family).id).query

    expect(licenses).to be_empty
  end

  it "doesn't get license if license is not present for particular" do
    licensees = described_class.new(create(:tenancy), report_family.id).query

    expect(licensees).to be_empty
  end
end
