# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Reports::RemapAssessment, type: :model do
  let!(:report) { create(:report, assessments: build_list(:assessment, 2)) }

  let!(:assesmsent1) { report.assessments.first }
  let!(:assesmsent2) { report.assessments.last }

  before do
    report.filters.create(assessment_id: assesmsent1.id)
    page = report.pages.create!(display_logic: {
      'conditions' => [{ 'prefix' => 'And',
                         'conditions' => [{ 'answer' => 'Completed', 'prefix' => 'And',
                                            'subject' => assesmsent1.id.to_s, 'conditionType' => 'Assessment' },
                                          { 'answer' => 'ResultAvailable', 'prefix' => 'And',
                                            'subject' => assesmsent1.id.to_s,
                                            'conditionType' => 'Assessment' }] }]
    })
    page.modules.create!(assessment_id: assesmsent1.id, props: {
      textConditions: [{ 'id' => 972, 'styles' => {}, 'conditions' => [
        { 'type' => 'Factor', 'props' => {
          'operation' => 'Mean', 'predicate' => 'GreaterThen',
          'assessmentId' => assesmsent1.id.to_s, 'subject' => '3743'
        } }
      ] }]
    })
  end

  it 'should be 2 assesmsnets' do
    expect(report.assessments.size).to eq(2)
  end

  it 'call' do
    described_class.call!(report, assesmsent1.id, assesmsent2.id)

    expect(report.filters.first.assessment_id).to eq(assesmsent2.id)
    expect(report.modules.first.assessment_id).to eq(assesmsent2.id)
    expect(report.pages.first.display_logic.dig('conditions', 0, 'conditions', 0,
                                                'subject')).to eq(assesmsent2.id.to_s)
    expect(report.modules.first.props.dig('textConditions', 0, 'conditions', 0, 'props',
                                          'assessmentId')).to eq(assesmsent2.id.to_s)
  end
end
