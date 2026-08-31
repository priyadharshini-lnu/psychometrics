# frozen_string_literal: true

require 'rails_helper'

describe CampaignScoring::Calculate do
  let(:campaign) { create(:campaign) }
  let(:assessment) { create(:assessment) }
  let(:factor) { create(:factor, dimension: assessment.dimension) }
  let(:question) { create(:question, assessment: assessment) }
  let(:user) { create(:user) }
  let(:assessor) { create(:assessor) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let!(:assessor_relationship) { create(:relationship, name: Relationship::ASSESSOR, type: :global) }
  let!(:self_relationship) { create(:relationship, name: Relationship::SELF, type: :global) }

  describe 'calculate assessment factor_type' do
    let!(:users_result) do
      scoring = {}
      scoring[factor.id.to_s] = { 'norm_score' => 1, 'score' => 2, 'zscore' => 3.3, 'percentage' => 4 }
      create(
        :users_result, campaign: campaign, assessment: assessment,
        scoring: scoring, subject: user, evaluator: user, status: :completed,
        score_calculated: true
      )
    end

    it 'returns norm_score' do
      cf = create(
        :campaign_factor, campaign: campaign, assessment: assessment, factor: factor,
        factor_type: 'assessment', assessment_score_type: 'norm_score'
      )
      values = described_class.call!(campaign, user)

      expect(values[cf].value).to eq(1)
    end

    it 'returns score' do
      cf = create(
        :campaign_factor, campaign: campaign, assessment: assessment, factor: factor,
        factor_type: 'assessment', assessment_score_type: 'score'
      )
      values = described_class.call!(campaign, user)

      expect(values[cf].value).to eq(2)
    end

    it 'returns zscore' do
      cf = create(
        :campaign_factor, campaign: campaign, assessment: assessment, factor: factor,
        factor_type: 'assessment', assessment_score_type: 'zscore'
      )
      values = described_class.call!(campaign, user)

      expect(values[cf].value).to eq(3.3)
    end

    it 'returns percentage' do
      cf = create(
        :campaign_factor, campaign: campaign, assessment: assessment, factor: factor,
        factor_type: 'assessment', assessment_score_type: 'percentage'
      )
      values = described_class.call!(campaign, user)

      expect(values[cf].value).to eq(4)
    end

    it 'returns Infinity' do
      cf = create(
        :campaign_factor, campaign: campaign, factor_type: 'formula', output_type: 'numeric',
        formula: 'return 1/0'
      )
      values = described_class.call!(campaign, user)

      expect(values[cf].value).to eq(nil)
      expect(values[cf].error_message).to eq("Expected factor value for '#{cf.code}'. Got Infinity value")
    end

    it 'returns WrongOutputTypeException' do
      cf = create(
        :campaign_factor, campaign: campaign, assessment: assessment, factor: factor,
        factor_type: 'assessment', assessment_score_type: 'percentage', output_type: 'string'
      )
      values = described_class.call!(campaign, user)

      expect(values[cf].value).to eq(nil)
      expect(values[cf].error_message).to eq("Expected factor value for '#{cf.code}' to be a string. Got Integer")
    end

    it 'returns nil if user_assessment is not completed' do
      users_result.user_assessment.update!(status: :in_progress)
      cf = create(
        :campaign_factor, campaign: campaign, assessment: assessment, factor: factor,
        factor_type: 'assessment', assessment_score_type: 'percentage'
      )
      values = described_class.call!(campaign, user)

      expect(values[cf].value).to eq(nil)
    end
  end

  describe 'calculate assessor_scoring factor_type' do
    let(:assessor_form) { create(:assessment, category: 'lead_assessor_form') }
    let(:assessor_assessment) { create(:assessment, category: :assessor_form) }

    it 'returns score' do
      create(
        :users_result, campaign: campaign, assessment: assessor_form,
        subject: user, status: :completed, score_calculated: true
      )
      cf = create(:campaign_factor, campaign: campaign, factor: factor, factor_type: 'assessor_scoring')
      create(:campaign_factor_value, campaign_factor: cf, user: user, campaign: campaign, numeric_value: 10)
      values = described_class.call!(campaign, user)

      expect(values[cf].value).to eq(10)
    end

    it 'returns nil if campaign_factor_value is not present' do
      create(
        :users_result, campaign: campaign, assessment: assessor_form,
        subject: user, status: :in_progress
      )
      cf = create(:campaign_factor, campaign: campaign, factor: factor, factor_type: 'assessor_scoring')
      values = described_class.call!(campaign, user)

      expect(values[cf].value).to eq(nil)
    end

    it 'returns calculated score if lead_assessor is nil' do
      cf = create(:campaign_factor, campaign: campaign, factor: factor, factor_type: 'assessor_scoring')
      assessor_user_assessment = create(:user_assessment, campaign: campaign, subject: user,
        assessment: assessor_assessment, relationship: Relationship.assessor_relationship, status: :completed)

      assessor_user_assessment.users_result.update!(
        scoring: {
          factor.id.to_s => { 'norm_score' => 3 }
        }
      )

      FactoryBot.create(:factors_scoring, factor: factor, assessment: assessor_user_assessment.assessment)

      values = described_class.call!(campaign, user)

      expect(values[cf].value).to eq(3.0)
    end
  end

  describe 'calculate datasheet factor_type' do
    let(:datasheet) { create(:datasheet, campaign: campaign) }
    let(:c1) { create(:sheet_column, sheet: datasheet, name: 'Title', column_type: 'string') }

    it 'returns datasheet value' do
      r1 = create(:sheet_row, email: user.email, sheet: datasheet)
      create(:sheet_row_datum, sheet_row: r1, sheet_column: c1, string_value: 'Software Engineer')
      cf = create(
        :campaign_factor, campaign: campaign, factor_type: 'formula',
        output_type: 'string', formula: "return datasheet.value('Title')"
      )
      values = described_class.call!(campaign, user)

      expect(values[cf].value).to eq('Software Engineer')
    end

    it 'returns nil if datasheet is not present' do
      cf = create(
        :campaign_factor, campaign: campaign, factor_type: 'formula',
        output_type: 'string', formula: "return datasheet.value('Title')"
      )
      values = described_class.call!(campaign, user)

      expect(values[cf].value).to eq(nil)
    end

    it 'returns nil if datasheet column is not present' do
      r1 = create(:sheet_row, email: user.email, sheet: datasheet)
      create(:sheet_row_datum, sheet_row: r1, sheet_column: c1, string_value: 'Software Engineer')
      cf = create(
        :campaign_factor, campaign: campaign, factor_type: 'formula',
        output_type: 'string', formula: "return datasheet.value('Age')"
      )
      values = described_class.call!(campaign, user)

      expect(values[cf].value).to eq(nil)
    end
  end

  describe 'calculate formula factor_type' do
    let(:factor1) { create(:factor, dimension: assessment.dimension) }
    let(:factor2) { create(:factor, dimension: assessment.dimension) }
    let!(:users_result) do
      scoring = {}
      scoring[factor1.id.to_s] = { 'norm_score' => 1, 'score' => 2 }
      scoring[factor2.id.to_s] = { 'norm_score' => 4.8, 'score' => 5 }
      create(
        :users_result, campaign: campaign, assessment: assessment,
        scoring: scoring, subject: user, evaluator: user, status: :completed, score_calculated: true
      )
    end

    it 'computes formula' do
      datasheet = create(:datasheet, campaign: campaign)
      c1 = create(:sheet_column, sheet: datasheet, name: 'Previous Score', column_type: 'number')
      c2 = create(:sheet_column, sheet: datasheet, name: 'Grade', column_type: 'string')

      r1 = create(:sheet_row, email: user.email, sheet: datasheet)
      create(:sheet_row_datum, sheet_row: r1, sheet_column: c1, numeric_value: 10)
      create(:sheet_row_datum, sheet_row: r1, sheet_column: c2, string_value: '1')
      create(
        :campaign_factor, code: 'factor1', campaign: campaign, assessment: assessment, factor: factor1,
        factor_type: 'assessment', assessment_score_type: 'score'
      )
      create(
        :campaign_factor, code: 'factor2', campaign: campaign, assessment: assessment, factor: factor2,
        factor_type: 'assessment', assessment_score_type: 'norm_score'
      )
      create(
        :campaign_factor, code: 'grade', campaign: campaign, factor_type: 'formula',
        output_type: 'string', formula: "return datasheet.value('Grade')"
      )
      create(
        :campaign_factor, code: 'previous_score', campaign: campaign, factor_type: 'formula',
        output_type: 'numeric', formula: "return datasheet.value('Previous Score')"
      )
      formula_cf = create(
        :campaign_factor, campaign: campaign, factor_type: 'formula',
        formula: %{
          previous_score = __previous_score
          if __grade == '1' then
            previous_score = previous_score*0.5
          end
          avg_factor_score = (__factor1 + __factor2) / 2
          return avg_factor_score + previous_score
        }
      )

      values = described_class.call!(campaign, user)

      expect(values[formula_cf].value).to eq(((2 + 4.8) / 2) + (10 * 0.5))
    end

    it 'handles single and double quote in factor value' do
      datasheet = create(:datasheet, campaign: campaign)
      c1 = create(:sheet_column, sheet: datasheet, name: 'Previous Grade', column_type: 'string')
      c2 = create(:sheet_column, sheet: datasheet, name: 'Grade', column_type: 'string')

      r1 = create(:sheet_row, email: user.email, sheet: datasheet)
      create(:sheet_row_datum, sheet_row: r1, sheet_column: c2, string_value: '1"')
      create(:sheet_row_datum, sheet_row: r1, sheet_column: c1, string_value: "2'")

      create(
        :campaign_factor, code: 'grade', campaign: campaign, factor_type: 'formula',
         output_type: 'string', formula: "return datasheet.value('Grade')"
      )
      create(
        :campaign_factor, code: 'previous_grade', campaign: campaign, factor_type: 'formula',
        output_type: 'string',  formula: "return datasheet.value('Previous Grade')"
      )
      formula_cf = create(
        :campaign_factor, campaign: campaign, factor_type: 'formula', output_type: 'string',
        formula: %(
          return __grade .. __previous_grade
        )
      )

      values = described_class.call!(campaign, user)
      expect(values[formula_cf].value).to eq("1\"2'")
    end

    it 'returns exception when adding nil to number' do
      users_result.user_assessment.update!(status: :in_progress)
      create(
        :campaign_factor, code: 'factor1', campaign: campaign, assessment: assessment, factor: factor1,
        factor_type: 'assessment', assessment_score_type: 'score'
      )
      create(
        :campaign_factor, code: 'factor2', campaign: campaign, assessment: assessment, factor: factor2,
        factor_type: 'assessment', assessment_score_type: 'norm_score'
      )
      formula_cf = create(
        :campaign_factor, campaign: campaign, factor_type: 'formula',
        formula: %(
          return __factor1 + __factor2
        )
      )
      values = described_class.call!(campaign, user)
      expect(values[formula_cf].error.class).to eq(Lua::Exceptions::RuntimeError)
      expect(values[formula_cf].error.message).to eq(
        "<eval>:7: attempt to perform arithmetic on a nil value (global '__factor1')"
      )
    end

    it 'calculates even when dependent string factor is not calculated' do
      create(
        :campaign_factor, code: 'factor1', campaign: campaign, factor_type: 'formula', output_type: 'string',
        formula: 'return nil'
      )
      create(
        :campaign_factor, code: 'factor2', campaign: campaign, assessment: assessment, factor: factor2,
        factor_type: 'assessor_scoring', assessment_score_type: 'norm_score', output_type: 'string'
      )
      create(
        :campaign_factor, code: 'factor3', campaign: campaign, factor_type: 'formula', output_type: 'string',
         formula: "return 'factor3 string'"
      )
      formula_cf = create(
        :campaign_factor, campaign: campaign, factor_type: 'formula', output_type: 'string',
        formula: %(
          return __factor1 or __factor2 or __factor3
        )
      )
      values = described_class.call!(campaign, user)
      expect(values[formula_cf].value).to eq('factor3 string')
    end

    it 'calculates even when dependent numeric factor is not calculated' do
      create(
        :campaign_factor, code: 'factor1', campaign: campaign, factor_type: 'formula', formula: 'return nil',
         output_type: 'numeric'
      )
      create(
        :campaign_factor, code: 'factor2', campaign: campaign, assessment: assessment, factor: factor2,
        factor_type: 'assessor_scoring', assessment_score_type: 'norm_score', output_type: 'numeric'
      )
      create(
        :campaign_factor, code: 'factor3', campaign: campaign, factor_type: 'formula', output_type: 'numeric',
        formula: 'return 2'
      )
      formula_cf = create(
        :campaign_factor, campaign: campaign, factor_type: 'formula', output_type: 'numeric',
        formula: %(
          return __factor1 or __factor2 or __factor3
        )
      )
      values = described_class.call!(campaign, user)
      expect(values[formula_cf].value).to eq(2)
    end

    it 'return exceptions if dependent factor is not present' do
      formula_cf = create(
        :campaign_factor, campaign: campaign, factor_type: 'formula',
        formula: %(
          return __unknown_factor + __factor2
        )
      )

      values = described_class.call!(campaign, user)
      expect(values[formula_cf].error_message).to eq("Dependent factor 'unknown_factor' and 'factor2' not found")
      expect(values[formula_cf].value).to eq(nil)
    end

    it 'returns WrongOutputTypeException' do
      create(
        :campaign_factor, code: 'factor1', campaign: campaign, assessment: assessment, factor: factor1,
        factor_type: 'assessment', assessment_score_type: 'score'
      )
      formula_cf = create(
        :campaign_factor, campaign: campaign, factor_type: 'formula', output_type: 'string',
        formula: %(
          return __factor1
        )
      )

      values = described_class.call!(campaign, user)
      expect(values[formula_cf].error_message).to eq(
        "Expected factor value for '#{formula_cf.code}' to be a string. Got Integer"
      )
      expect(values[formula_cf].value).to eq(nil)
    end

    it 'has access to campaign_scoring_variables' do
      create(
        :campaign_option,
        campaign: campaign,
        campaign_scoring_variables: %(
          factor_weight = 1.5
          campaign_type = 'Management'
        )
      )
      create(
        :campaign_factor, code: 'factor1', campaign: campaign, assessment: assessment, factor: factor1,
        factor_type: 'assessment', assessment_score_type: 'score', output_type: 'numeric'
      )
      formula_cf = create(
        :campaign_factor, campaign: campaign, factor_type: 'formula', output_type: 'numeric',
        formula: %(
          weight = vars['factor_weight']
          if vars['campaign_type'] == 'Management' then
            weight = weight * 3
          end
          return __factor1*weight
        )
      )

      values = described_class.call!(campaign, user)
      expect(values[formula_cf].value).to eq(2 * 1.5 * 3)
    end

    it 'formula factor can depend on other formula fields' do
      create(:campaign_option, campaign: campaign, campaign_scoring_variables: 'factor_weight = 1.5')
      create(
        :campaign_factor, code: 'factor1', campaign: campaign, assessment: assessment, factor: factor1,
        factor_type: 'assessment', assessment_score_type: 'score', output_type: 'numeric'
      )
      create(
        :campaign_factor, code: 'factor2', campaign: campaign, assessment: assessment, factor: factor2,
        factor_type: 'assessment', assessment_score_type: 'norm_score', output_type: 'numeric'
      )
      formula_cf1 = create(
        :campaign_factor, campaign: campaign, factor_type: 'formula', output_type: 'numeric', code: 'formula1',
        formula: %(
          return __factor1 * 2
        )
      )
      formula_cf2 = create(
        :campaign_factor, campaign: campaign, factor_type: 'formula', output_type: 'numeric', code: 'formula2',
        formula: %(
          return __formula1 * __formula3
        )
      )
      formula_cf3 = create(
        :campaign_factor, campaign: campaign, factor_type: 'formula', output_type: 'numeric', code: 'formula3',
        formula: %(
          return __factor2 * 3
        )
      )
      formula_cf4 = create(
        :campaign_factor, campaign: campaign, factor_type: 'formula', output_type: 'numeric',
        formula: %(
          return __formula2 * 1.5
        )
      )

      values = described_class.call!(campaign, user)
      formula_cf1_value = 2 * 2
      formula_cf3_value = 4.8 * 3
      expect(values[formula_cf1].value).to eq(formula_cf1_value)
      expect(values[formula_cf2].value).to eq(formula_cf1_value * formula_cf3_value)
      expect(values[formula_cf3].value).to eq(formula_cf3_value)
      expect(values[formula_cf4].value).to eq(formula_cf1_value * formula_cf3_value * 1.5)
    end
  end

  describe 'already computed campign_factor' do
    let(:factor1) { create(:factor, dimension: assessment.dimension) }
    let!(:users_result) do
      scoring = {}
      scoring[factor1.id.to_s] = { 'norm_score' => 1, 'score' => 2 }
      create(
        :users_result, campaign: campaign, assessment: assessment,
        scoring: scoring, subject: user, evaluator: user, status: :completed, score_calculated: true
      )
    end

    it "doesn't recompute" do
      cf_factor1 = create(
        :campaign_factor, code: 'factor1', campaign: campaign, assessment: assessment, factor: factor1,
        factor_type: 'assessment', assessment_score_type: 'score'
      )
      create(:campaign_factor_value, campaign_factor: cf_factor1, user: user, campaign: campaign, numeric_value: 10)

      values = described_class.call!(campaign, user)
      expect(values[cf_factor1].value).to eq(10)
    end
  end

  it 'can use assessment factor score from user assessment' do
    scoring = {}
    scoring[factor.id.to_s] = { 'norm_score' => 1, 'score' => 2, 'zscore' => 3.3, 'percentage' => 40 }
    create(
      :users_result, campaign: campaign, assessment: assessment,
      scoring: scoring, subject: user, evaluator: user, status: :completed, score_calculated: true
    )
    norm_score = create(
      :campaign_factor, campaign: campaign, assessment: assessment, factor: factor,
      factor_type: 'formula', formula: "return assessment.norm_score(#{assessment.id}, #{factor.id})"
    )
    raw_score = create(
      :campaign_factor, campaign: campaign, assessment: assessment, factor: factor,
      factor_type: 'formula', formula: "return assessment.raw_score(#{assessment.id}, #{factor.id})"
    )
    zscore = create(
      :campaign_factor, campaign: campaign, assessment: assessment, factor: factor,
      factor_type: 'formula', formula: "return assessment.zscore(#{assessment.id}, #{factor.id})"
    )
    percentage = create(
      :campaign_factor, campaign: campaign, assessment: assessment, factor: factor,
      factor_type: 'formula', formula: "return assessment.percentage_answered(#{assessment.id}, #{factor.id})"
    )

    values = described_class.call!(campaign, user)

    expect(values[norm_score].value).to eq(1)
    expect(values[raw_score].value).to eq(2)
    expect(values[zscore].value).to eq(3.3)
    expect(values[percentage].value).to eq(40)
  end

  it 'can return lua table as calculated output' do
    create(
      :users_result, campaign: campaign, assessment: assessment,
      subject: user, evaluator: user, status: :completed, score_calculated: true
    )

    score_and_label = create(
      :campaign_factor, campaign: campaign, assessment: assessment, factor: factor, output_type: 'string',
      factor_type: 'formula', formula: 'return { label = "Javascript", value = "Good" }'
    )

    values = described_class.call!(campaign, user)

    expect(values[score_and_label].value).to eq('Good')
    expect(values[score_and_label].label).to eq('Javascript')
  end

  it 'can use user answers of type from user assessment' do
    answers = {}
    answers[question.id.to_s] = { 'dirty' => false,
                                  'answers' => [{ 'index' => 0, 'value' => 2.2 },
                                                { 'index' => 1, 'value' => 'Javascript' }] }

    create(
      :users_result, campaign: campaign, assessment: assessment,
      answers: answers, subject: user, evaluator: user, status: :completed, score_calculated: true
    )

    skill = create(
      :campaign_factor, campaign: campaign, assessment: assessment, factor: factor, output_type: 'string',
      factor_type: 'formula', formula: "return assessment.form_answer(#{assessment.id}, #{question.id}, 1)"
    )

    skill_score = create(
      :campaign_factor, campaign: campaign, assessment: assessment, factor: factor, factor_type: 'formula',
      formula: "return helpers.round(assessment.form_answer(#{assessment.id}, #{question.id}, 0), 0)"
    )

    skill_score_from_json_path = create(
      :campaign_factor, campaign: campaign, assessment: assessment, factor: factor,
      factor_type: 'formula',
      formula: "return assessment.answer(#{assessment.id},  \"$.#{question.id}['answers'][0].value\")"
    )

    values = described_class.call!(campaign, user)

    expect(values[skill].value).to eq('Javascript')
    expect(values[skill_score].value).to eq(2)
    expect(values[skill_score_from_json_path].value).to eq(2.2)
  end

  it 'raises an error when round receives a string answer from assessments' do
    answers = {}
    answers[question.id.to_s] = { 'dirty' => false,
                                  'answers' => [{ 'index' => 0, 'value' => '2.267' }] }

    create(
      :users_result, campaign: campaign, assessment: assessment,
      answers: answers, subject: user, evaluator: user, status: :completed, score_calculated: true
    )

    rounded_score = create(
      :campaign_factor, campaign: campaign, assessment: assessment, factor: factor,
      factor_type: 'formula',
      formula: "return helpers.round(assessment.form_answer(#{assessment.id}, #{question.id}, 0), 2)"
    )

    values = described_class.call!(campaign, user)

    expect(values[rounded_score].value).to eq(nil)
    expect(values[rounded_score].error_message).to eq('helpers.round: First parameter must be numeric.')
  end

  it 'can use user answers of type from assessor assessment' do
    answers = {}
    answers[question.id.to_s] = { 'dirty' => false,
                                  'answers' => [{ 'index' => 0, 'value' => 2.2 },
                                                { 'index' => 1, 'value' => 'Javascript' }] }

    create(
      :users_result, campaign: campaign, assessment: assessment, relationship: assessor_relationship,
      answers: answers, subject: user, evaluator: assessor.user, status: :completed, score_calculated: true
    )

    skill_score = create(
      :campaign_factor, campaign: campaign, assessment: assessment, factor: factor,
      factor_type: 'formula', formula: "return assessment.form_answer(#{assessment.id}, #{question.id}, 0, 'Assessor')"
    )

    skill_score_from_json_path = create(
      :campaign_factor, campaign: campaign, assessment: assessment, factor: factor,
      factor_type: 'formula',
      formula: "return assessment.answer(#{assessment.id},  \"$.#{question.id}['answers'][0].value\", 'Assessor')"
    )

    values = described_class.call!(campaign, user)

    expect(values[skill_score].value).to eq(2.2)
    expect(values[skill_score_from_json_path].value).to eq(2.2)
  end

  it 'can fetch user feedback results from user assessment' do
    answers = {}
    answers[question.id.to_s] = { 'dirty' => false,
                                  'answers' => [
                                    { 'code' => 'code1', 'value' => 'Good' },
                                    { 'code' => 'code2' }
                                  ] }

    create(
      :users_result, campaign: campaign, assessment: assessment,
      answers: answers, subject: user, evaluator: user, status: :completed, score_calculated: true
    )

    feedback_question1 = create(
      :campaign_factor, campaign: campaign, assessment: assessment, factor: factor,
      factor_type: 'formula', output_type: 'string',
      formula: "return assessment.campaign_feedback_answer(#{assessment.id}, #{question.id}, 'code1')"
    )

    feedback_question2 = create(
      :campaign_factor, campaign: campaign, assessment: assessment, factor: factor,
      factor_type: 'formula', output_type: 'string',
      formula: "return assessment.campaign_feedback_answer(#{assessment.id}, #{question.id}, 'code2')"
    )

    values = described_class.call!(campaign, user)

    expect(values[feedback_question1].value).to eq('Good')
    expect(values[feedback_question2].value).to eq(nil)
  end

  it 'can fetch user feedback results from assessor assessment' do
    answers = {}
    answers[question.id.to_s] = { 'dirty' => false,
                                  'answers' => [
                                    { 'code' => 'code1', 'value' => 'Good' },
                                    { 'code' => 'code2' }
                                  ] }

    create(
      :users_result, campaign: campaign, assessment: assessment, relationship: assessor_relationship,
      answers: answers, subject: user, evaluator: assessor.user, status: :completed, score_calculated: true
    )

    feedback_question1 = create(
      :campaign_factor, campaign: campaign, assessment: assessment, factor: factor,
      factor_type: 'formula', output_type: 'string',
      formula: "return assessment.campaign_feedback_answer(#{assessment.id}, #{question.id}, 'code1', 'Assessor')"
    )

    values = described_class.call!(campaign, user)

    expect(values[feedback_question1].value).to eq('Good')
  end

  it 'skip calculation of external score factor type' do
    create(
      :campaign_factor, campaign: campaign, assessment: assessment, factor: factor,
      factor_type: 'external_score'
    )

    values = described_class.call!(campaign, user)

    expect(values).to be_empty
  end

  describe 'assessment.status' do
    let(:assessor_form) { create(:assessment, category: 'assessor_form') }

    it 'returns nil when no user_assessment record exists' do
      cf = create(
        :campaign_factor, campaign: campaign, factor_type: 'formula', output_type: 'string',
        formula: "return assessment.status(#{assessment.id})"
      )

      values = described_class.call!(campaign, user)

      expect(values[cf].value).to eq(nil)
    end

    it 'returns in_progress when user_assessment status is in_progress' do
      create(:user_assessment, campaign: campaign, assessment: assessment, subject: user, evaluator: user,
        status: :in_progress)
      cf = create(
        :campaign_factor, campaign: campaign, factor_type: 'formula', output_type: 'string',
        formula: "return assessment.status(#{assessment.id})"
      )

      values = described_class.call!(campaign, user)

      expect(values[cf].value).to eq('in_progress')
    end

    it 'returns completed when user_assessment status is completed' do
      create(
        :users_result, campaign: campaign, assessment: assessment,
        subject: user, evaluator: user, status: :completed, score_calculated: true
      )
      cf = create(
        :campaign_factor, campaign: campaign, factor_type: 'formula', output_type: 'string',
        formula: "return assessment.status(#{assessment.id})"
      )

      values = described_class.call!(campaign, user)

      expect(values[cf].value).to eq('completed')
    end

    it 'returns interrupted when user_assessment status is interrupted' do
      create(:user_assessment, campaign: campaign, assessment: assessment, subject: user, evaluator: user,
        status: :interrupted)
      cf = create(
        :campaign_factor, campaign: campaign, factor_type: 'formula', output_type: 'string',
        formula: "return assessment.status(#{assessment.id})"
      )

      values = described_class.call!(campaign, user)

      expect(values[cf].value).to eq('interrupted')
    end

    it 'returns ineligible when user_assessment status is ineligible' do
      create(:user_assessment, campaign: campaign, assessment: assessment, subject: user, evaluator: user,
        status: :ineligible)
      cf = create(
        :campaign_factor, campaign: campaign, factor_type: 'formula', output_type: 'string',
        formula: "return assessment.status(#{assessment.id})"
      )

      values = described_class.call!(campaign, user)

      expect(values[cf].value).to eq('ineligible')
    end

    it 'raises an error when assessor form id is passed' do
      cf = create(
        :campaign_factor, campaign: campaign, factor_type: 'formula', output_type: 'string',
        formula: "return assessment.status(#{assessor_form.id})"
      )

      values = described_class.call!(campaign, user)

      expect(values[cf].value).to eq(nil)
      expect(values[cf].error_message).to eq(
        'assessment.status: Only self-assessment IDs are allowed. Assessor form IDs are not permitted.'
      )
    end

    it 'raises an error when assessment is not found' do
      cf = create(
        :campaign_factor, campaign: campaign, factor_type: 'formula', output_type: 'string',
        formula: 'return assessment.status(0)'
      )

      values = described_class.call!(campaign, user)

      expect(values[cf].value).to eq(nil)
      expect(values[cf].error_message).to eq("assessment.status: Assessment with ID '0' not found.")
    end
  end

  describe 'lua helpers' do
    it 'it can return values rounded to specified digits' do
      round = create(
        :campaign_factor, campaign: campaign, assessment: assessment, factor: factor,
        factor_type: 'formula', formula: 'return helpers.round(2.267, 2)'
      )

      values = described_class.call!(campaign, user)

      expect(values[round].value).to eq(2.27)
    end

    it 'it can find avarage using average helper' do
      average = create(
        :campaign_factor, campaign: campaign, assessment: assessment, factor: factor,
        factor_type: 'formula', formula: 'return helpers.average({46.66, 61}, 2)'
      )

      average_without_precision = create(
        :campaign_factor, campaign: campaign, assessment: assessment, factor: factor,
        factor_type: 'formula', formula: 'return helpers.average({5.843, 3.34}, nil)'
      )

      values = described_class.call!(campaign, user)
      expect(values[average].value).to eq(53.83)
      expect(values[average_without_precision].value).to eq(4.5915)
    end

    it 'it can find avarage using average helper' do
      average = create(
        :campaign_factor, campaign: campaign, assessment: assessment, factor: factor,
        factor_type: 'formula', formula: 'return helpers.average({46.66, 61}, 2)'
      )

      average_without_precision = create(
        :campaign_factor, campaign: campaign, assessment: assessment, factor: factor,
        factor_type: 'formula', formula: 'return helpers.average({5.843, 3.34}, nil)'
      )

      values = described_class.call!(campaign, user)
      expect(values[average].value).to eq(53.83)
      expect(values[average_without_precision].value).to eq(4.5915)
    end

    it 'it raise error when precision is not passed in average helper' do
      average = create(
        :campaign_factor, campaign: campaign, assessment: assessment, factor: factor,
        factor_type: 'formula', formula: 'return helpers.average({46.66, 61})'
      )

      values = described_class.call!(campaign, user)
      expect(values[average].error_message).to eq(
        'helpers.average: First parameter must be a Lua table, and second parameter is precision (integer)'
      )
    end
  end

  describe 'lua.user configuration' do
    let!(:user_profile) { create(:user_profile, user: user, age: 30, gender: 'male', locale: 'en') }
    let(:question) { create(:question) }
    let(:profile_field) do
      create(:profile_field, question_id: question.id, profile_setting: campaign.project.profile_setting)
    end

    it 'calls fixed_field_value on user' do
      first_name_cf = create(
        :campaign_factor, campaign: campaign, assessment: assessment, factor: factor,
        factor_type: 'formula', output_type: 'string',
        formula: "return user.fixed_field_value('first_name')"
      )

      values = described_class.call!(campaign, user)

      expect(values[first_name_cf].value).to eq(user.first_name)
    end

    it 'calls custom_profile_field_value on user' do
      create(:profile_field_value, user_profile: user_profile, profile_field: profile_field, numeric_value: nil,
              string_value: 'Developer')

      user_role_cf = create(
        :campaign_factor, campaign: campaign, assessment: assessment, factor: factor,
        factor_type: 'formula', output_type: 'string',
        formula:  "return user.custom_profile_field_value(#{profile_field.id})"
      )

      values = described_class.call!(campaign, user)

      expect(values[user_role_cf].value).to eq('Developer')
    end
  end
end
