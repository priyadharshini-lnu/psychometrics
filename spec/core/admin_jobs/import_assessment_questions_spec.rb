# frozen_string_literal: true

require 'rails_helper'

describe AdminJobs::ImportAssessmentQuestions do
  let(:campaign) { create(:campaign) }
  let(:project) { create(:project) }
  let(:dimension) { create(:dimension) }
  let(:assessment) { create(:assessment, dimension: dimension) }
  let!(:block) { create(:block, assessment: assessment, name: 'Default Block') }
  let!(:accountability_factor) { create(:factor, dimension: dimension, name: 'Accountability') }
  let!(:grit_factor) { create(:factor, dimension: dimension, name: '.Grit.1') }
  let(:job_record) do
    create(
      :admin_job_record, operation: :import_assessment_questions,
      data: { assessment_id: assessment.id }
    )
  end
  before do
    roo_excel = Roo::Excelx.new(Rails.root.join('spec/fixtures/files/import_assessment_questions/valid_file.xlsx'))
    allow_any_instance_of(AdminJobs::ImportAssessmentQuestions).to receive(:roo_excel).and_return(roo_excel)
  end

  it 'creates all questions and block' do
    described_class.call!(job_record)
    assessment.reload
    questions = assessment.questions.includes(:block).to_a
    verify_blocks
    verify_text_entry_question(questions)
    verify_multiple_choice_question(questions)
    verify_matrix_question(questions)
    verify_static_question(questions)
    verify_page_break(questions)
    verify_scoring(questions)
  end

  def verify_blocks
    blocks = assessment.blocks.pluck(:name, :position).to_h
    expect(blocks).to eq({
      'Default Block' => 1,
      'YTI' => 2,
      'ETI' => 3
    })
  end

  def verify_text_entry_question(questions) # rubocop:disable Metrics/AbcSize
    q1 = questions.find { |q| q.name == 'Q1' }
    q2 = questions.find { |q| q.name == 'Q2' }
    q3 = questions.find { |q| q.name == 'Q3' }

    expect(q1.position).to eq(1)
    expect(q2.position).to eq(2)
    expect(q3.position).to eq(3)

    expect(q1.type).to eq('TextEntry')
    expect(q2.type).to eq('TextEntry')
    expect(q3.type).to eq('TextEntry')

    expect(q1.block.name).to eq('Default Block')
    expect(q2.block.name).to eq('Default Block')
    expect(q3.block.name).to eq('Default Block')

    expect(q1.props['type']).to eq('SingleLine')
    expect(q2.props['type']).to eq('MultiLine')
    expect(q3.props['type']).to eq('EssayTextBox')

    expect(q1.required_validation).to eq({ 'enabled' => true, 'type' => 'Force' })
    expect(q2.required_validation).to eq({ 'enabled' => true, 'type' => 'Request' })
    expect(q3.required_validation).to eq({ 'enabled' => false, 'type' => 'Force' })
  end

  def verify_multiple_choice_question(questions) # rubocop:disable Metrics/AbcSize
    q4 = questions.find { |q| q.name == 'Q4' }
    q5 = questions.find { |q| q.name == 'Q5' }
    q6 = questions.find { |q| q.name == 'Q6' }

    expect(q4.type).to eq('MultipleChoice')
    expect(q5.type).to eq('MultipleChoice')
    expect(q6.type).to eq('MultipleChoice')

    expect(q4.position).to eq(1) # second block starts so position is 1
    expect(q5.position).to eq(2)
    expect(q6.position).to eq(1) # third block starts so position is 1

    expect(q4.block.name).to eq('YTI')
    expect(q5.block.name).to eq('YTI')
    expect(q6.block.name).to eq('ETI')

    expect(q4.props['type']).to eq('SingleAnswer')
    expect(q5.props['type']).to eq('MultipleAnswer')
    expect(q6.props['type']).to eq('Dropdown')

    expect(q4.props['choicesTexts']).to eq(%w[Yes No Maybe])
    expect(q5.props['choicesTexts']).to eq(%w[UAE KSA Ireland])
    expect(q6.props['choicesTexts']).to eq(%w[English Arabic])

    expect(q4.required_validation).to eq({ 'enabled' => true, 'type' => 'Force' })
    expect(q5.required_validation).to eq({ 'enabled' => false, 'type' => 'Force' })
    expect(q6.required_validation).to eq({ 'enabled' => true, 'type' => 'Request' })

    expect(q4.props['randomization']).to eq({ 'type' => 'No' })
    expect(q5.props['randomization']).to eq({ 'type' => 'Some', 'questions' => 1 })
    expect(q6.props['randomization']).to eq({ 'type' => 'All' })
  end

  def verify_matrix_question(questions) # rubocop:disable Metrics/AbcSize
    q7 = questions.find { |q| q.name == 'Q7' }
    q8 = questions.find { |q| q.name == 'Q8' }

    expect(q7.type).to eq('MatrixTable')
    expect(q8.type).to eq('MatrixTable')

    expect(q7.position).to eq(3)
    expect(q8.position).to eq(4)

    expect(q7.block.name).to eq('ETI')
    expect(q8.block.name).to eq('ETI')
    expect(q7.props['type']).to eq('Likert')
    expect(q8.props['type']).to eq('Likert')
    expect(q7.props['choicesTexts']).to eq(%w[Commitment Agility])
    expect(q8.props['choicesTexts']).to eq(%w[Commitment Agility Resilience])
    expect(q7.props['scalePointsTexts']).to eq(['Does not Demonstrate',	'Sometimes Demonstrates',	'Often Demonstrates'])
    expect(q8.props['scalePointsTexts']).to eq(['Strongly Agree',	'Agree',	'Disagree'])
    expect(q7.required_validation).to eq({ 'enabled' => true, 'type' => 'Force' })
    expect(q8.required_validation).to eq({ 'enabled' => false, 'type' => 'Force' })
  end

  def verify_static_question(questions)
    q9 = questions.find { |q| q.name == 'Q9' }
    expect(q9.type).to eq('StaticContent')
    expect(q9.props['type']).to eq('Text')
    expect(q9.block.name).to eq('ETI')
  end

  def verify_page_break(questions)
    page_break = questions.find { |q| q.name == 'PB' }

    expect(page_break.position).to eq(2)
    expect(page_break.type).to eq('PageBreak')
  end

  def verify_scoring(questions)
    q4 = questions.find { |q| q.name == 'Q4' }
    q7 = questions.find { |q| q.name == 'Q7' }
    q4_accountability_scores = q4.factors_scorings.find { |fs| fs.factor_id == accountability_factor.id }
    q4_grit_scores = q4.factors_scorings.find { |fs| fs.factor_id == grit_factor.id }
    q7_accountability_scores = q7.factors_scorings.find { |fs| fs.factor_id == accountability_factor.id }
    q7_grit_scores = q7.factors_scorings.find { |fs| fs.factor_id == grit_factor.id }

    expect(q4_accountability_scores.props).to eq(
      [{ 'index' => 0, 'value' => 1 }, { 'index' => 2, 'value' => 3 }]
    )
    expect(q4_grit_scores.props).to eq(
      [{ 'index' => 0, 'value' => 2 }, { 'index' => 1, 'value' => 4 }, { 'index' => 2, 'value' => 5 }]
    )
    expect(q7_accountability_scores.props).to eq(
      [{
        'choice' => 0,
        'scale' => 0,
        'value' => 1
      }, {
        'choice' => 0,
        'scale' => 1,
        'value' => 2
      }, {
        'choice' => 0,
        'scale' => 2,
        'value' => 1
      }, {
        'choice' => 1,
        'scale' => 0,
        'value' => 2
      }, {
        'choice' => 1,
        'scale' => 1,
        'value' => 1
      }, {
        'choice' => 1,
        'scale' => 2,
        'value' => 2
      }]
    )
    expect(q7_grit_scores.props).to eq(
      [{
        'choice' => 1,
        'scale' => 0,
        'value' => 4
      }, {
        'choice' => 1,
        'scale' => 2,
        'value' => 5
      }]
    )
  end
end
