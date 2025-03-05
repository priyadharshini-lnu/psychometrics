# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Builders::AssessmentTranslationBuilder do
  let!(:assessment) { create(:assessment, type: Assessments::Common) }
  let!(:block) { create(:block, assessment: assessment) }
  let!(:question) { create(:question, type: 'GapAnalysis', assessment: assessment, block: block) }
  let(:assessment_params) do
    ActionController::Parameters.new(
      {
        'instructions' => {
          'content' => '<p>Sample instructions content</p>',
          'enabled' => true
        },
        'blocks' => [
          {
            'id' => block.id,
            'props' => {
              'staticContent' => {
                'value' => 'Static content for block'
              }
            },
            'questions' => [
              {
                'id' => question.id,
                'type' => 'GapAnalysis',
                'props' => {
                  'questionText' => 'Question 1',
                  'tellUsText' => 'Tell Us Why',
                  'categoriesText' => 'Categories',
                  'randomization' => { type: 'No' },
                  'choices' => 3,
                  'scalePoints' => 3,
                  'choicesTexts' => [
                    'Click to write Category 1',
                    'Click to write Category 2',
                    'Click to write Category 3'
                  ],
                  'categoriesData' => [
                    { texts: %w[Why Why Why] },
                    { texts: %w[Why Why Why] },
                    { texts: %w[Why Why Why] }
                  ]
                }
              }
            ]
          }
        ]
      }
    )
  end

  let(:selected_locale) { 'en' }
  let(:builder) { described_class.new(assessment, assessment_params, selected_locale) }

  describe '#save' do
    it 'updates instruction translations' do
      expect { builder.save }.to change { Translation.count }.by(3)

      translation = Translation.first
      expect(translation.translateable_type).to eq('Instructions')

      expect(translation.data).to eq({ 'props' => { 'content' => '<p>Sample instructions content</p>' } })
    end

    it 'updates block translations' do
      builder.save
      block_translation = Translation.find_by(translateable_type: 'Block', translateable_id: block.id)

      expect(block_translation).to be_present
      expect(block_translation.data).to eq(
        { 'props' => { 'staticContent' => { 'value' => 'Static content for block' } } }
      )
    end

    it 'updates question translations' do
      builder.save
      question_translation = Translation.find_by(translateable_type: 'Question', translateable_id: question.id)

      expect(question_translation).to be_present
      expect(question_translation.data).to include({ 'props' =>
      { 'tellUsText' => 'Tell Us Why',
        'choicesTexts' => ['Click to write Category 1', 'Click to write Category 2', 'Click to write Category 3'],
        'questionText' => 'Question 1',
        'categoriesData' => [{ 'texts' => %w[Why Why Why] }, { 'texts' => %w[Why Why Why] },
                             { 'texts' => %w[Why Why Why] }],
        'categoriesText' => 'Categories' },
                                                     'validation' => {} })
    end
  end
end
