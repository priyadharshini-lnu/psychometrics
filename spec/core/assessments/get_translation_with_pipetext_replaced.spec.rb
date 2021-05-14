# frozen_string_literal: true

require 'rails_helper'

describe Assessments::GetTranslationWithPipetextReplaced do
  let(:assessment) { create(:assessment) }
  let(:block) { create(:block, assessment: assessment) }
  let(:question) { create(:question, assessment: assessment) }

  it 'returns assessment transalations with pipetext values' do
    create(:translation, resource_id: assessment.id, resource_type: 'Assessments::Common',
      translateable: question, locale: 'fr', props: { questionText: 'salut {{subject/FirstName}}' })
    expect(Threesixty::PipedText::Perform).to receive(:call!).
      with('salut {{subject/FirstName}}', {}).and_return('salut John')

    result = described_class.call!(assessment, locale: 'fr', piped_text_context: {})
    text = result.dig('question', question.id, 'questionText')

    expect(text).to eq('salut John')
  end

  it 'returns report/modules transalations with pipetext values' do
    create(:translation, resource_id: assessment.id, resource_type: 'Assessments::Common',
      translateable: block, locale: 'fr', props: { 'staticContent' => 'salut {{subject/FirstName}}' })
    expect(Threesixty::PipedText::Perform).to receive(:call!).
      with('salut {{subject/FirstName}}', {}).and_return('salut John')
    result = described_class.call!(assessment, locale: 'fr', piped_text_context: {})
    text = result.dig('block', block.id, 'staticContent')

    expect(text).to eq('salut John')
  end
end
