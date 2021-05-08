# frozen_string_literal: true

require 'rails_helper'

describe API::NormalizeCampaignParams do
  it 'contains "campaigns" array' do
    response = described_class.call!({ campaigns: [
                                       { id: 1, active: true, existing_record: 'new_evaluation' },
                                       { id: 2, active: false, existing_record: 'copy_evaluation' },
                                       { id: 3, active: false }
                                     ] })

    expect(response).to eq({ campaigns: [
                             { id: 1, active: true, existing_record: 'add_and_allow_new_response' },
                             { id: 2, active: false, existing_record: 'add_with_existing_response' },
                             { id: 3, active: false, existing_record: nil }
                           ] })
  end
  it 'does not contain "campaigns" array' do
    response = described_class.call!({ campaign_ids: [1, 2] })

    expect(response).to eq({ campaign_ids: [1, 2], campaigns: [
                             { id: 1, active: true, existing_record: 'add_and_allow_new_response' },
                             { id: 2, active: true, existing_record: 'add_and_allow_new_response' }
                           ] })
  end
end
