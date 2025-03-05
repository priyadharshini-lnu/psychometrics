# frozen_string_literal: true

require 'rails_helper'

describe UserAssessments::ResetProgress do
  let(:user_result) do
    create(
      :users_result,
      answers: { '1' => { 'answers' => [] } },
      scoring: { '120' => { 'score' => 10 } },
      occupations: { '1' => 'abc' },
      embedded_data: { 'ip' => '129.1.1.1' },
      meta_data: { 'id' => 1 },
      current_element: '1/1',
      current_page: '3',
      prev_pages: %w[1 2],
      step: 2,
      progress: 30
    )
  end
  let(:user_assessment) do
    create(:user_assessment,
           users_result: user_result,
           status: :completed,
           completed_at: Time.zone.now,
           completion_reason: :user_completed,
           norm: create(:norm))
  end

  it 'resets details in user result and makr user_assessment in_progress' do
    described_class.call(user_assessment)

    expect(user_assessment.status).to eq('in_progress')
    expect(user_assessment.completed_at).to eq(nil)
    expect(user_assessment.completion_reason).to eq(nil)
    expect(user_assessment.norm_id).to eq(nil)
    expect(user_result.scoring).to eq(nil)
    expect(user_result.occupations).to eq(nil)
    expect(user_result.embedded_data).to eq(nil)
    expect(user_result.meta_data).to eq({})
    expect(user_result.current_element).to eq(nil)
    expect(user_result.current_page).to eq(nil)
    expect(user_result.prev_pages).to eq([])
    expect(user_result.step).to eq(0)
    expect(user_result.progress).to eq(0)
  end

  it 'sets all answers as dirty' do
    described_class.call(user_assessment)

    expect(user_result.answers).to eq({ '1' => { 'answers' => [], 'dirty' => true } })
  end

  it 'removes report pdf' do
    assessment = create(:assessment, :with_report)
    user_assessment = create(:user_assessment, assessment: assessment)
    user_report = create(:user_report, report: assessment.reports.first,
      user_id: user_assessment.subject_id, campaign_id: user_assessment.campaign_id, status: :prepared)
    create(:user_report_pdf, :with_pdf, user_report: user_report)

    user_assessment.completed!
    described_class.call!(user_assessment)

    expect(user_report.user_report_pdf.pdf_file.attached?).to be_falsey
    expect(user_report.reload.status).to eq('not_prepared')
  end
end
