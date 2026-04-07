# frozen_string_literal: true

require 'rails_helper'

describe UsersResults::Scoring::MergeAIScores do
  let(:dimension) { create(:dimension) }
  let(:assessment) { create(:assessment, dimension: dimension) }
  let(:user_assessment) { create(:user_assessment, assessment: assessment) }
  let(:users_result) { user_assessment.users_result }

  let(:factor1) { create(:factor, dimension: dimension, scoring_strategy: :questions, scale_max: 5.0) }
  let(:factor2) { create(:factor, dimension: dimension, scoring_strategy: :questions, scale_max: 5.0) }
  let(:parent_factor) { create(:factor, dimension: dimension, scoring_strategy: :sub_factors_average) }

  let(:question1) { create(:question, assessment: assessment) }
  let(:question2) { create(:question, assessment: assessment) }
  let(:question3) { create(:question, assessment: assessment) }

  before do
    create(:factors_sub_factor, factor: parent_factor, sub_factor: factor1, weight: 1)
    create(:factors_sub_factor, factor: parent_factor, sub_factor: factor2, weight: 1)
    allow(UserAssessments::PostScoringTasks).to receive(:call!)
    user_assessment.update!(approval_status: :approver_approved)
  end

  describe '#call' do
    context 'when user_assessment is auto_approved without approval flow' do
      before do
        user_assessment.update!(approval_status: :auto_approved)
        allow(user_assessment).to receive(:has_ai_scoring_approval_flow?).and_return(false)
        users_result.update!(scoring: {})

        create(:ai_factor_score,
               users_result: users_result,
               factor: factor1,
               question: question1,
               score: 4.0,
               status: :approver_approved)
      end

      it 'merges AI scores into scoring' do
        result = described_class.call!(users_result)

        expect(result.keys).to include(factor1.id.to_s)
        expect(result[factor1.id.to_s]['results'].first['value']).to eq(4.0)
      end
    end

    context 'when user_assessment approval_status is not approver_approved' do
      it 'returns current scoring unchanged without merging AI scores' do
        users_result.update!(scoring: { '1' => { 'score' => 3.0 } })
        user_assessment.update!(approval_status: :pending)

        create(:ai_factor_score,
               users_result: users_result,
               factor: factor1,
               question: question1,
               score: 4.0,
               status: :approver_approved)

        result = described_class.call!(users_result)

        expect(result).to eq({ '1' => { 'score' => 3.0 } })
        expect(UserAssessments::PostScoringTasks).not_to have_received(:call!)
      end
    end

    context 'when no AI scores exist' do
      it 'returns current scoring unchanged' do
        users_result.update!(scoring: { '1' => { 'score' => 3.0 } })

        result = described_class.call!(users_result)

        expect(result).to eq({ '1' => { 'score' => 3.0 } })
      end
    end

    context 'when AI scores exist but current scoring is empty' do
      before do
        users_result.update!(scoring: {})

        create(:ai_factor_score,
               users_result: users_result,
               factor: factor1,
               question: question1,
               score: 4.0,
               status: :approver_approved)
      end

      it 'creates scoring from AI scores only' do
        result = described_class.call!(users_result)

        expect(result.keys).to include(factor1.id.to_s)
        expect(result[factor1.id.to_s]['results'].first['value']).to eq(4.0)
      end

      it 'calculates parent factors' do
        result = described_class.call!(users_result)

        expect(result.keys).to include(parent_factor.id.to_s)
      end
    end

    context 'when merging distinct factors (no overlap)' do
      before do
        users_result.update!(
          scoring: {
            factor1.id.to_s => {
              'results' => [
                { 'value' => 3.0, 'question_id' => question1.id, 'max_value' => 5.0, 'value_sum' => 3.0 }
              ],
              'score' => 3.0
            }
          }
        )

        create(:ai_factor_score,
               users_result: users_result,
               factor: factor2,
               question: question2,
               score: 4.0,
               confidence: 0.9,
               citations: ['Good work'],
               rationale: 'Strong performance',
               status: :approver_approved)
      end

      it 'merges AI scores into the final scoring' do
        result = described_class.call!(users_result)

        expect(result.keys).to include(factor1.id.to_s, factor2.id.to_s, parent_factor.id.to_s)
      end

      it 'preserves static factor results' do
        result = described_class.call!(users_result)

        expect(result[factor1.id.to_s]['results'].length).to eq(1)
        expect(result[factor1.id.to_s]['results'].first['value']).to eq(3.0)
      end

      it 'adds AI factor results' do
        result = described_class.call!(users_result)

        expect(result[factor2.id.to_s]['results'].length).to eq(1)
        expect(result[factor2.id.to_s]['results'].first['value']).to eq(4.0)
      end

      it 'recalculates parent factors' do
        result = described_class.call!(users_result)

        expect(result[parent_factor.id.to_s]).to be_present
        expect(result[parent_factor.id.to_s]['score']).to eq(3.5)
      end

      it 'persists the merged scoring' do
        described_class.call!(users_result)

        users_result.reload
        expect(users_result.scoring.keys).to include(factor1.id.to_s, factor2.id.to_s)
      end

      it 'preserves AI metadata' do
        result = described_class.call!(users_result)

        ai_result = result[factor2.id.to_s]['results'].first
        expect(ai_result['ai_metadata']).to eq({
          'confidence' => 0.9,
          'citations' => ['Good work'],
          'rationale' => 'Strong performance'
        })
      end
    end

    context 'when duplicates exist (same factor in both static and AI)' do
      before do
        users_result.update!(
          scoring: {
            factor1.id.to_s => {
              'results' => [
                { 'value' => 3.0, 'question_id' => question1.id, 'max_value' => 5.0, 'value_sum' => 3.0 }
              ],
              'score' => 3.0
            }
          }
        )

        create(:ai_factor_score,
               users_result: users_result,
               factor: factor1,
               question: question2,
               score: 5.0,
               status: :approver_approved)
      end

      it 'combines results from both sources' do
        result = described_class.call!(users_result)

        factor1_data = result[factor1.id.to_s]
        expect(factor1_data['results'].length).to eq(2)
      end

      it 'includes both question IDs in results' do
        result = described_class.call!(users_result)

        question_ids = result[factor1.id.to_s]['results'].pluck('question_id')
        expect(question_ids).to contain_exactly(question1.id, question2.id)
      end

      it 'recalculates score from combined results' do
        result = described_class.call!(users_result)

        expect(result[factor1.id.to_s]['score']).to eq(4.0)
      end

      it 'recalculates parent factors with new child score' do
        result = described_class.call!(users_result)

        expect(result[parent_factor.id.to_s]).to be_present
      end

      it 'clears old pre-calculated scores' do
        result = described_class.call!(users_result)

        expect(result[factor1.id.to_s]['score']).not_to eq(3.0)
      end
    end

    context 'when same question exists in both static and AI (deduplication)' do
      before do
        users_result.update!(
          scoring: {
            factor1.id.to_s => {
              'results' => [
                { 'value' => 3.0, 'question_id' => question1.id, 'max_value' => 5.0, 'value_sum' => 3.0 }
              ],
              'score' => 3.0
            }
          }
        )

        create(:ai_factor_score,
               users_result: users_result,
               factor: factor1,
               question: question1,
               score: 5.0,
               confidence: 0.95,
               status: :approver_approved)
      end

      it 'replaces static score with AI score for same question' do
        result = described_class.call!(users_result)

        factor1_results = result[factor1.id.to_s]['results']
        expect(factor1_results.length).to eq(1)
        expect(factor1_results.first['value']).to eq(5.0)
      end

      it 'preserves AI metadata for replaced score' do
        result = described_class.call!(users_result)

        factor1_result = result[factor1.id.to_s]['results'].first
        expect(factor1_result['ai_metadata']).to be_present
        expect(factor1_result['ai_metadata']['confidence']).to eq(0.95)
      end

      it 'does not duplicate the question_id' do
        result = described_class.call!(users_result)

        question_ids = result[factor1.id.to_s]['results'].pluck('question_id')
        expect(question_ids).to eq([question1.id])
      end

      it 'recalculates score using AI value' do
        result = described_class.call!(users_result)

        expect(result[factor1.id.to_s]['score']).to eq(5.0)
      end
    end

    context 'when merge is executed multiple times with same AI score' do
      let!(:ai_score) do
        create(:ai_factor_score,
               users_result: users_result,
               factor: factor1,
               question: question1,
               score: 4.0,
               status: :approver_approved)
      end

      before do
        users_result.update!(
          scoring: {
            factor1.id.to_s => {
              'results' => [
                { 'value' => 3.0, 'question_id' => question1.id, 'max_value' => 5.0, 'value_sum' => 3.0 }
              ],
              'score' => 3.0
            }
          }
        )
      end

      it 'does not create duplicate results on multiple merges' do
        described_class.call!(users_result)
        users_result.reload

        first_merge_results = users_result.scoring[factor1.id.to_s]['results']
        expect(first_merge_results.length).to eq(1)

        described_class.call!(users_result)
        users_result.reload

        second_merge_results = users_result.scoring[factor1.id.to_s]['results']
        expect(second_merge_results.length).to eq(1)
        expect(second_merge_results.first['value']).to eq(4.0)
      end

      it 'maintains consistent score across multiple merges' do
        described_class.call!(users_result)
        first_score = users_result.reload.scoring[factor1.id.to_s]['score']

        described_class.call!(users_result)
        second_score = users_result.reload.scoring[factor1.id.to_s]['score']

        expect(first_score).to eq(second_score)
        expect(first_score).to eq(4.0)
      end
    end

    context 'when static has empty results and AI has scores' do
      before do
        users_result.update!(
          scoring: {
            factor1.id.to_s => { 'results' => [] }
          }
        )

        create(:ai_factor_score,
               users_result: users_result,
               factor: factor1,
               question: question1,
               score: 4.0,
               status: :approver_approved)
      end

      it 'replaces empty results with AI scores' do
        result = described_class.call!(users_result)

        factor1_data = result[factor1.id.to_s]
        expect(factor1_data['results'].length).to eq(1)
        expect(factor1_data['results'].first['value']).to eq(4.0)
      end

      it 'calculates correct score from AI results' do
        result = described_class.call!(users_result)

        expect(result[factor1.id.to_s]['score']).to eq(4.0)
      end
    end

    context 'when AI scores are not approved' do
      before do
        users_result.update!(
          scoring: {
            factor1.id.to_s => { 'score' => 3.0 }
          }
        )

        create(:ai_factor_score,
               users_result: users_result,
               factor: factor2,
               question: question1,
               score: 4.0,
               status: :pending)
      end

      it 'does not include pending AI scores' do
        result = described_class.call!(users_result)

        expect(result.keys).to contain_exactly(factor1.id.to_s)
      end
    end

    context 'when all factors are duplicates' do
      before do
        users_result.update!(
          scoring: {
            factor1.id.to_s => {
              'results' => [
                { 'value' => 3.0, 'question_id' => question1.id, 'max_value' => 5.0, 'value_sum' => 3.0 }
              ],
              'score' => 3.0
            },
            factor2.id.to_s => {
              'results' => [
                { 'value' => 2.0, 'question_id' => question1.id, 'max_value' => 5.0, 'value_sum' => 2.0 }
              ],
              'score' => 2.0
            }
          }
        )

        create(:ai_factor_score,
               users_result: users_result,
               factor: factor1,
               question: question2,
               score: 5.0,
               status: :approver_approved)

        create(:ai_factor_score,
               users_result: users_result,
               factor: factor2,
               question: question2,
               score: 4.0,
               status: :approver_approved)
      end

      it 'recalculates all duplicate factors' do
        result = described_class.call!(users_result)

        expect(result[factor1.id.to_s]['results'].length).to eq(2)
        expect(result[factor2.id.to_s]['results'].length).to eq(2)
      end

      it 'calculates correct scores for all factors' do
        result = described_class.call!(users_result)

        expect(result[factor1.id.to_s]['score']).to eq(4.0)
        expect(result[factor2.id.to_s]['score']).to eq(3.0)
      end

      it 'recalculates parent based on new child scores' do
        result = described_class.call!(users_result)

        expect(result[parent_factor.id.to_s]['score']).to eq(3.5)
      end
    end

    context 'complex hierarchy with duplicates' do
      let(:grandparent) { create(:factor, dimension: dimension, scoring_strategy: :sub_factors_average) }

      before do
        create(:factors_sub_factor, factor: grandparent, sub_factor: parent_factor, weight: 1)

        users_result.update!(
          scoring: {
            factor1.id.to_s => {
              'results' => [
                { 'value' => 3.0, 'question_id' => question1.id, 'max_value' => 5.0, 'value_sum' => 3.0 }
              ],
              'score' => 3.0
            }
          }
        )

        create(:ai_factor_score,
               users_result: users_result,
               factor: factor1,
               question: question2,
               score: 5.0,
               status: :approver_approved)
      end

      it 'recalculates all ancestors in the hierarchy' do
        result = described_class.call!(users_result)

        expect(result[factor1.id.to_s]).to be_present
        expect(result[parent_factor.id.to_s]).to be_present
        expect(result[grandparent.id.to_s]).to be_present
      end

      it 'calculates correct scores through hierarchy' do
        result = described_class.call!(users_result)

        expect(result[factor1.id.to_s]['score']).to eq(4.0)
      end
    end

    context 'scenario: replace nil with AI value' do
      before do
        users_result.update!(
          scoring: {
            factor1.id.to_s => { 'results' => [] }
          }
        )

        create(:ai_factor_score,
               users_result: users_result,
               factor: factor1,
               question: question1,
               score: 5.0,
               status: :approver_approved)
      end

      it 'replaces nil/empty static scores with AI scores' do
        result = described_class.call!(users_result)

        expect(result[factor1.id.to_s]['results'].length).to eq(1)
        expect(result[factor1.id.to_s]['score']).to eq(5.0)
      end
    end

    context 'scenario: merge and recalculate duplicates' do
      before do
        users_result.update!(
          scoring: {
            factor1.id.to_s => {
              'results' => [
                { 'value' => 3.0, 'question_id' => question1.id, 'max_value' => 5.0, 'value_sum' => 3.0 }
              ],
              'score' => 3.0
            }
          }
        )

        create(:ai_factor_score,
               users_result: users_result,
               factor: factor1,
               question: question2,
               score: 5.0,
               status: :approver_approved)
      end

      it 'merges results from both sources' do
        result = described_class.call!(users_result)

        results = result[factor1.id.to_s]['results']
        expect(results.pluck('value')).to contain_exactly(3.0, 5.0)
      end

      it 'recalculates score as average' do
        result = described_class.call!(users_result)

        expect(result[factor1.id.to_s]['score']).to eq(4.0)
      end
    end

    context 'parent recalculation with updated child' do
      before do
        users_result.update!(
          scoring: {
            factor1.id.to_s => {
              'results' => [
                { 'value' => 3.0, 'question_id' => question1.id, 'max_value' => 5.0, 'value_sum' => 3.0 }
              ],
              'score' => 3.0
            },
            factor2.id.to_s => {
              'results' => [
                { 'value' => 4.0, 'question_id' => question1.id, 'max_value' => 5.0, 'value_sum' => 4.0 }
              ],
              'score' => 4.0
            },
            parent_factor.id.to_s => { 'score' => 3.5 }
          }
        )

        create(:ai_factor_score,
               users_result: users_result,
               factor: factor1,
               question: question2,
               score: 5.0,
               status: :approver_approved)
      end

      it 'recalculates child factor with AI score' do
        result = described_class.call!(users_result)

        expect(result[factor1.id.to_s]['score']).to eq(4.0)
      end

      it 'recalculates parent using new child score and unchanged sibling' do
        result = described_class.call!(users_result)

        expect(result[parent_factor.id.to_s]['score']).to eq(4.0)
      end

      it 'preserves unchanged sibling factor' do
        result = described_class.call!(users_result)

        expect(result[factor2.id.to_s]['score']).to eq(4.0)
      end
    end

    context 'mixed approved and pending AI scores for same factor' do
      before do
        users_result.update!(scoring: {})

        create(:ai_factor_score,
               users_result: users_result,
               factor: factor1,
               question: question1,
               score: 4.0,
               status: :approver_approved)

        create(:ai_factor_score,
               users_result: users_result,
               factor: factor1,
               question: question2,
               score: 5.0,
               status: :pending)
      end

      it 'only includes approved AI scores' do
        result = described_class.call!(users_result)

        expect(result[factor1.id.to_s]['results'].length).to eq(1)
        expect(result[factor1.id.to_s]['results'].first['value']).to eq(4.0)
      end

      it 'calculates score from approved results only' do
        result = described_class.call!(users_result)

        expect(result[factor1.id.to_s]['score']).to eq(4.0)
      end
    end

    context 'multiple questions for same factor' do
      before do
        users_result.update!(
          scoring: {
            factor1.id.to_s => {
              'results' => [
                { 'value' => 3.0, 'question_id' => question1.id, 'max_value' => 5.0, 'value_sum' => 3.0 },
                { 'value' => 2.0, 'question_id' => question2.id, 'max_value' => 5.0, 'value_sum' => 2.0 }
              ],
              'score' => 2.5
            }
          }
        )

        create(:ai_factor_score,
               users_result: users_result,
               factor: factor1,
               question: question3,
               score: 5.0,
               status: :approver_approved)
      end

      it 'adds AI score to existing multiple results' do
        result = described_class.call!(users_result)

        expect(result[factor1.id.to_s]['results'].length).to eq(3)
      end

      it 'recalculates average from all results' do
        result = described_class.call!(users_result)

        expect(result[factor1.id.to_s]['score']).to be_within(0.01).of(3.33)
      end
    end

    context 'with override_score' do
      before do
        users_result.update!(scoring: {})
        create(:ai_factor_score,
               users_result: users_result,
               factor: factor1,
               question: question1,
               score: 3.0,
               override_score: 4.5,
               status: :approver_approved)
      end

      it 'uses override_score instead of ai_score' do
        result = described_class.call!(users_result)
        expect(result[factor1.id.to_s]['results'].first['value']).to eq(4.5)
      end
    end
  end
end
