# frozen_string_literal: true

require 'rails_helper'

describe Api::V1::Campaigns::UpdateForm do
  let(:campaign) { create(:campaign, start_date: '2021-03-06T17:20:43+04:00') }
  it 'validates end_date' do
    form = described_class.new({ end_date: '2020-03-06T17:20:43+04:00' }).with_context(campaign: campaign)

    expect(form.valid?).to eq(false)
    expect(form.errors[:end_date]).to include('must be after the start date')
  end
end
