# frozen_string_literal: true

require 'rails_helper'

describe CampaignScoring::Calculate do
  let(:campaign) { create(:campaign) }
  let(:assessment) { create(:assessment) }
  let(:factor) { create(:factor, dimension: assessment.dimension) }
  let(:user) { create(:user) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }

  describe 'calculate assessment factor_type' do
    let!(:users_result) do
      scoring = {}
      scoring[factor.id.to_s] = { 'norm_score' => 1, 'score' => 2, 'zscore' => 3.3, 'percentage' => 4 }
      create(
        :users_result, campaign: campaign, assessment: assessment,
        scoring: scoring, subject: user, evaluator: user, status: :completed
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

    it 'returns score' do
      create(
        :users_result, campaign: campaign, assessment: assessor_form,
        subject: user, status: :completed
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
  end

  describe 'calculate datasheet factor_type' do
    let(:datasheet) { create(:datasheet, campaign: campaign) }

    it 'returns datasheet value' do
      create(:sheet_row, email: user.email, sheet: datasheet, data: { 'Title' => 'Software Engineer' })
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
      create(:sheet_row, email: user.email, sheet: datasheet, data: { 'Title' => 'Software Engineer' })
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
        scoring: scoring, subject: user, evaluator: user, status: :completed
      )
    end

    it 'computes formula' do
      datasheet = create(:datasheet, campaign: campaign)
      create(:sheet_row, email: user.email, sheet: datasheet, data: { 'Grade' => '1', 'Previous Score' => 10 })
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
      create(:sheet_row, email: user.email, sheet: datasheet, data: { 'Grade' => '1"', 'Previous Grade' => "2'" })
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
        scoring: scoring, subject: user, evaluator: user, status: :completed
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
      scoring: scoring, subject: user, evaluator: user, status: :completed
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
end
