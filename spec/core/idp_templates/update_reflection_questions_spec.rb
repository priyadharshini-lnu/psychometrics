# frozen_string_literal: true

require 'rails_helper'

RSpec.describe IdpTemplates::UpdateReflectionQuestions do
  let!(:project) { create(:project) }
  let!(:idp_template) { create(:idp_template, project: project) }
  let!(:reflection_question) { create(:reflection_question, project_id: project.id) }
  let!(:reflection_question2) { create(:reflection_question, project_id: project.id) }

  let(:params) do
    [{
      id: reflection_question.id,
      mandatory: true,
      min_words: 10,
      max_words: 100
    }]
  end

  describe '#call' do
    before do
      idp_template.reflection_questions << reflection_question2
    end

    it 'should create a new reflection question and delete missing reflection questions' do
      described_class.call(idp_template, params)

      expect(idp_template.reflection_questions.count).to eq(1)
      expect(idp_template.reflection_questions.exists?(id: reflection_question2.id)).to be_falsey
      expect(idp_template.reflection_questions.exists?(id: reflection_question.id)).to be_truthy
      expect(idp_template.reflection_questions.first).to eq(reflection_question)
    end

    it 'should take params from params' do
      described_class.call(idp_template, params)

      itrk = idp_template.idp_template_reflection_questions.find_by(reflection_question_id: reflection_question.id)
      expect(itrk).to be_present
      expect(itrk.mandatory).to be_truthy
      expect(itrk.min_words).to eq(10)
      expect(itrk.max_words).to eq(100)
    end
  end
end
