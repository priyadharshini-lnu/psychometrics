# frozen_string_literal: true

require 'rails_helper'

describe Reports::GetTranslationWithPipetextReplaced do
  let(:report) { create(:report) }
  let!(:report_module) { create(:module, page: create(:page, report: report)) }
  let(:assessment) { report.assessments.first }
  let!(:question) { create(:question, assessment: assessment) }

  it 'returns assessment transalations with pipetext values' do
    create(:translation, resource_id: assessment.id, resource_type: 'Assessments::Common',
      translateable: question, locale: 'fr', props: { questionText: 'salut {{subject/FirstName}}' })
    expect(Threesixty::PipedText::Perform).to receive(:call!).
      with('salut {{subject/FirstName}}', {}).and_return('salut John')

    result = described_class.call!(report, locale: 'fr', piped_text_context: {})
    text = result.dig('question', question.id, 'questionText')

    expect(text).to eq('salut John')
  end

  it 'returns report/modules transalations with pipetext values' do
    create(:translation, resource: report, translateable: report_module,
      locale: 'fr', props: { text: 'salut {{subject/FirstName}}' })
    expect(Threesixty::PipedText::Perform).to receive(:call!).
      with('salut {{subject/FirstName}}', {}).and_return('salut John')

    result = described_class.call!(report, locale: 'fr', piped_text_context: {})
    text = result.dig('reports/module', report_module.id, 'text')

    expect(text).to eq('salut John')
  end
end
