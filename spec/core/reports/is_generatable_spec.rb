# frozen_string_literal: true

require 'rails_helper'

describe Reports::IsGeneratable do
  it "return true if report doesn't have multiple assessment" do
    report = create(:report, assessments: [build(:assessment)])

    result = described_class.call!(report, build(:assign))

    expect(result).to eq(true)
  end

  it 'return true if all assessments for report is completed' do
    assessments = create_list(:assessment, 2)
    report = create(:report, assessments: assessments)
    assign1 = create(:assign, assessment: assessments.first, status: :completed)
    create(:assign, assessment: assessments.second, status: :completed,
      membership: assign1.membership)

    result = described_class.call!(report, assign1)

    expect(result).to eq(true)
  end

  it 'return false if some assessments for report is completed' do
    assessments = create_list(:assessment, 2)
    report = create(:report, assessments: assessments)
    assign1 = create(:assign, assessment: assessments.first, status: :completed)
    create(:assign, assessment: assessments.second, status: :in_progress, membership: assign1.membership)

    result = described_class.call!(report, assign1)

    expect(result).to eq(false)
  end
end
