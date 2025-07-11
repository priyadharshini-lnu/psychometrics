# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UsersResults::CalculateSkillRaterScores do
  let(:user_result) { create(:users_result) }
  let(:skill) { create(:skill, factor: create(:factor)) }
  let(:question) { create(:question, type: 'SkillRater', skill: skill) }

  subject(:calculator) { described_class.new(user_result) }

  describe '#call' do
    context 'when answers are empty' do
      before { allow(user_result).to receive(:answers).and_return({}) }

      it 'returns empty hash' do
        expect(calculator.call).to eq({})
      end
    end

    context 'with valid answers' do
      let(:answer_data) { { 'answers' => ['some_answer'] } }

      before do
        allow(user_result).to receive(:answers).and_return(
          { question.id.to_s => answer_data }
        )
      end

      context 'when scoring calculation returns a value' do
        let(:scoring_result) do
          { value: 3.5, max_value: 5.0 }
        end

        before do
          allow_any_instance_of(Scoring::SkillRater).to receive(:calculate).
            and_return(scoring_result)
        end

        it 'includes the question score in results' do
          result = calculator.call
          factor_result = result[skill.factor.id]

          expect(factor_result[:results]).to include(
            question_id: question.id,
            value: 3.5,
            max_value: 5.0
          )
          expect(factor_result[:score]).to eq(3.5)
        end
      end

      context 'when scoring calculation returns no value' do
        before do
          allow_any_instance_of(Scoring::SkillRater).to receive(:calculate).
            and_return(value: nil)
        end

        it 'excludes the question from results' do
          result = calculator.call
          expect(result).to be_empty
        end
      end
    end
  end
end
