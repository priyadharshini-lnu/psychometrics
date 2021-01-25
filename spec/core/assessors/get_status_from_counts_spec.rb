# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Assessors::GetStatusFromCounts do
  it 'returns completed when total and completed count matches' do
    status = described_class.call!({ total: 2, completed: 2 })

    expect(status).to eq(:completed)
  end

  it 'returns in_progress is either of completion, in_progress or interuppted count is more than 0' do
    status = described_class.call!({ total: 2, in_progress: 1 })
    expect(status).to eq(:in_progress)

    status = described_class.call!({ total: 2, completed: 1 })
    expect(status).to eq(:in_progress)

    status = described_class.call!({ total: 2, interrupted: 1 })
    expect(status).to eq(:in_progress)
  end

  it 'returns not_started if all the counts are 0' do
    status = described_class.call!({ total: 2, not_started: 1, in_progress: 0, interrupted: 0, completed: 0 })

    expect(status).to eq(:not_started)
  end
end
