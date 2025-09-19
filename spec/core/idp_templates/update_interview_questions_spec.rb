# frozen_string_literal: true

require 'rails_helper'

RSpec.describe IdpTemplates::UpdateInterviewQuestions do
  let!(:project) { create(:project) }
  let!(:idp_template) { create(:idp_template, project: project) }
  let!(:interview_question) { create(:interview_question, project_id: project.id) }
  let!(:interview_question2) { create(:interview_question, project_id: project.id) }

  let(:params) do
    [{
      id: interview_question.id,
      mandatory: true,
      time_limit: 30
    }]
  end

  describe '#call' do
    before do
      idp_template.interview_questions << interview_question2
    end

    it 'should create a new interview question and delete missing interview questions' do
      described_class.call(idp_template, params)

      expect(idp_template.interview_questions.count).to eq(1)
      expect(idp_template.interview_questions.exists?(id: interview_question2.id)).to be_falsey
      expect(idp_template.interview_questions.exists?(id: interview_question.id)).to be_truthy
      expect(idp_template.interview_questions.first).to eq(interview_question)
    end

    it 'should take params from params' do
      described_class.call(idp_template, params)

      itrk = idp_template.idp_template_interview_questions.find_by(interview_question_id: interview_question.id)
      expect(itrk).to be_present
      expect(itrk.mandatory).to be_truthy
      expect(itrk.time_limit).to eq(30)
      expect(itrk.order).to eq(0)
    end

    it 'should order by passed order' do
      described_class.call(idp_template, [{
        id: interview_question.id,
        mandatory: true,
        time_limit: 30
      }, {
        id: interview_question2.id,
        mandatory: false,
        time_limit: 20
      }])

      itrk = idp_template.idp_template_interview_questions
      expect(itrk.find_by(interview_question_id: interview_question.id).order).to eq(0)
      expect(itrk.find_by(interview_question_id: interview_question2.id).order).to eq(1)
    end
  end
end
