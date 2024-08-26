# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Webhooks::MettlController, type: :controller do
  let!(:project) { create(:project) }
  let(:config) { { 'public_key' => 'public_key', 'private_key' => 'private_key_value' } }
  let!(:mettl_assessment) { create(:mettl_assessment, project_id: project.id) }
  let(:assessment) do
    create(:assessment, :mettl, project: project, external_settings: { assessment_id: mettl_assessment.id })
  end

  let!(:mettl_schedule_record) { create(:mettl_schedule_record, project: project, assessment: assessment) }

  let(:user_assessment) { create(:user_assessment, assessment: assessment, project: project) }
  let!(:mettl_user_assessment) do
    create(:mettl_user_assessment, user_assessment: user_assessment)
  end

  let!(:jwt_token) do
    JWT.encode({ data: user_assessment.id, exp: 30.days.from_now.to_i }, Settings.secrets.webhook_jwt_secret)
  end

  describe 'POST #completion_notification' do
    let(:json_payload) do
      {
        EVENT_TYPE: 'finishTest',
        invitation_key: '23213',
        assessment_id: 1_225_766,
        candidate_instance_id: 136_419_634,
        context_data: "{\"token\": \"#{jwt_token}\"}",
        timestamp_GMT: 'Fri, 16 Aug 2024 13:14:21 GMT',
        source_app: 'lighthouse-development',
        notification_url: 'https://mettl.com',
        name: '35853 ',
        email: '35853@example.com',
        finish_mode: 'NormalSubmission'
      }.to_json
    end

    it 'sets user_assessment as completed' do
      post :completion_notification, params: { project_id: 1 }, body: json_payload

      expect(response).to have_http_status(:ok)

      user_assessment.reload
      expect(user_assessment.completed?).to be_truthy
    end
  end

  describe 'POST #results' do
    let(:json_payload) do
      {
        EVENT_TYPE: 'gradedAssessment',
        invitation_key: '23213',
        assessmentId: 1_225_766,
        candidate_instance_id: 136_419_634,
        context_data: "{\"token\": \"#{jwt_token}\"}",
        timestamp_GMT: 'Fri, 16 Aug 2024 13:14:22 GMT',
        source_app: 'lighthouse-development',
        notification_url: 'https://webhook.site/shuja-local',
        name: '35853',
        email: '35853@example.com',
        finish_mode: 'NormalSubmission',
        start_time_GMT: 'Fri, 16 Aug 2024 13:14:13 UTC',
        end_time_GMT: 'Fri, 16 Aug 2024 13:14:21 UTC',
        marks_scored: 0.0,
        max_marks: 1.0,
        total_attempt_time: 7,
        percentile: 90.9090909090909,
        assessment_name: 'Ruby on Rails',
        client_id: 611_691,
        schedule_title: 'Ruby on Rails - 940',
        start_time: 'Fri, 16 Aug 2024 18:44:13 IST',
        end_time: 'Fri, 16 Aug 2024 18:44:21 IST',
        sectional_scores: '[{"sectionName":"Section #1","sectionScore":0.0,"sectionMaxScore":1.0}]',
        grading_type: 'NormalGrading',
        registrationDetails: {
          'Email Address': '35853@example.com',
          'First Name': '35853',
          'Last Name': '35853'
        },
        proctoringDetails: nil,
        testStatus: {
          status: 'Completed',
          compensatoryTime: 'false',
          overallStatus: 'Completed',
          detailedStatus: 'Test-taker Completed',
          startTime: 'Fri, 16 Aug 2024 18:44:13 IST',
          endTime: 'Fri, 16 Aug 2024 18:44:21 IST',
          completionMode: 'Completed',
          result: {
            totalMarks: 0.0,
            maxMarks: 1.0,
            percentile: 90.9090909090909,
            attemptTime: 7.752,
            candidateCredibilityIndex: 'Not Applicable',
            codePlagiarism: 'NA',
            totalQuestion: 1.0,
            totalCorrectAnswers: 0.0,
            totalUnAnswered: 0.0,
            sectionMarks: [
              {
                sectionName: 'Section #1',
                totalMarks: 0.0,
                maxMarks: 1.0,
                timeTaken: 0.0,
                totalQuestion: 1.0,
                totalCorrectAnswers: 0.0,
                totalUnAnswered: 0.0,
                skillMarks: [
                  {
                    skillName: 'Agility',
                    totalMarks: 0.0,
                    maxMarks: 1.0,
                    timeTaken: 7.0,
                    totalQuestion: 1.0,
                    totalCorrectAnswers: 0.0,
                    totalUnAnswered: 0.0,
                    difficultyMarks: [
                      {
                        level: 'EASY',
                        totalQuestion: 1,
                        totalMarks: 0.0,
                        totalUnAnswered: 0,
                        maxMarks: 1.0,
                        timeTaken: 7,
                        totalCorrectAnswers: 0
                      }
                    ]
                  }
                ],
                difficultyMarks: [
                  {
                    level: 'EASY',
                    totalQuestion: 1,
                    totalMarks: 0.0,
                    totalUnAnswered: 0,
                    maxMarks: 1.0,
                    timeTaken: 7,
                    totalCorrectAnswers: 0
                  }
                ],
                questionWiseResponse: nil
              }
            ],
            performanceCategory: 'Poor',
            performanceCategoryVersion: 1,
            difficultyMarks: [
              {
                level: 'EASY',
                totalQuestion: 1,
                totalMarks: 0.0,
                totalUnAnswered: 0,
                maxMarks: 1.0,
                timeTaken: 7,
                totalCorrectAnswers: 0
              }
            ],
            analysis: {
              responseStyles: [],
              recommendation: [
                {
                  type: 'Performance Category',
                  value: 'Poor'
                }
              ]
            }
          },
          pdfReport: 'https://mettl.com/analytics/download-candidate-report?isCiim=false&isShareReport=true&comp=false&url=https%3A%2F%2Fmettl.com%2Fanalytics%2Fshare-report%3F%26key%3Dg2I6vCFGblKiCFatK2iNbg%253D%253D%26printPrivateReport%3Dfalse%26fetchRevaluationDetails%3Dtrue%26print%3Dtrue%26viewByUser%3D',
          htmlReport: 'https://mettl.com/analytics/share-report?key=g2I6vCFGblKiCFatK2iNbg%3D%3D'
        }
      }.to_json
    end

    it 'sets user_assessment as completed and saves scores' do
      expect(::Mettl::SaveScoresAndReport).to receive(:call!).with(user_assessment, JSON.parse(json_payload))

      post :results, params: { project_id: 1 }, body: json_payload

      expect(response).to have_http_status(:ok)

      user_assessment.reload
      expect(user_assessment.completed?).to be_truthy
    end
  end
end
