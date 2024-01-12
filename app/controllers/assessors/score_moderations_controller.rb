# frozen_string_literal: true

class Assessors::ScoreModerationsController < Assessors::BaseController
  include ::Threesixty::SetAssessmentLocale

  def show
    authorize(user, nil, campaign: campaign, policy_class: Assessors::ScoreModerationPolicy)

    lead_assessment = UserAssessments::GetLeadUserAssessmentForSubject.call!(campaign, user)

    attributes = { last_activity_at: DateTime.current }
    attributes = attributes.merge(started_at: Time.zone.now) unless lead_assessment.started_at
    lead_assessment.update!(attributes)

    render json: {
      lead_assessor_user_assessment_id: lead_assessment.id,
      lead_assessor_form: AssessmentSerializer.new(lead_assessment.assessment, selected_locale: selected_locale,
        piped_text_context: build_piped_context(lead_assessment)).to_hash(include: '**'),
      lead_assessor_result: UsersResultSerializer.new(
        context: { campaign: lead_assessment.campaign,
                   participant: lead_assessment,
                   current_user: current_user, locale: selected_locale,
                   piped_text_context: build_piped_context(lead_assessment) }
      ).serialize(lead_assessment.users_result)
    }
  end

  def assessor_assessments
    authorize(user, nil, campaign: campaign, policy_class: Assessors::ScoreModerationPolicy)

    assessor_assessments = Assessment.joins(:user_assessments).
                           where(category: Assessment::CATEGORIES[:assessor_form]).
                           where(user_assessments: { campaign_id: campaign.id, subject_id: user.id }).
                           distinct.select(:id, :name)

    render json: {
      assessor_assessments: assessor_assessments.map do |a|
        { id: a.id, assessment_id: a.id, name: a.name }
      end
    }
  end

  def reports
    authorize(user, nil, campaign: campaign, policy_class: Assessors::ScoreModerationPolicy)

    main_report = campaign.campaign_reports.find_by(main_report: true)
    main_user_report = if main_report
                         campaign.user_reports.find_by(report_id: main_report.report_id, user_id: user.id)
                       end

    if main_user_report&.all_assessments_are_completed?(except_assessment_ids: [campaign.lead_assessor_assessment.id])
      main_user_report_id = main_user_report.id
    end

    user_reports = campaign.user_reports.where(user_id: user.id, status: :prepared).
                   where.not(report_id: main_report&.report_id)

    render json: {
      reports: user_reports.map do |r|
        ShortUserReportSerializer.new(r).to_hash
      end,
      main_report_id: main_user_report_id
    }
  end

  def assessment_with_results
    authorize(user, nil, campaign: campaign, policy_class: Assessors::ScoreModerationPolicy)

    user_assessments = UserAssessment.where(
      campaign_id: campaign.id,
      subject_id: user.id,
      assessment_id: params[:assessment_id]
    )

    render json: {
      assessment: AssessmentSerializer.new(user_assessments.first.assessment, selected_locale: selected_locale,
                                          piped_text_context: build_piped_context(user_assessments.first)).
        to_hash(include: '**'),
      results: serializer_results(user_assessments)
    }
  end

  private

  def serializer_results(user_assessments)
    user_assessments.map do |user_assessment|
      selected_locale = user_assessment.selected_locale || user_locale

      UsersResultSerializer.new(context: { campaign: user_assessment.campaign,
                                           participant: user_assessment,
                                           current_user: current_user, locale: selected_locale,
                                           piped_text_context: build_piped_context(user_assessment) }).
        serialize(user_assessment.users_result)
    end
  end

  def build_piped_context(user_assessment)
    {
      evaluator: user_assessment.evaluator,
      subject: user_assessment.subject,
      campaign: user_assessment.campaign,
      result: user_assessment.users_result
    }
  end

  def campaign
    @campaign ||= Campaign.find(params[:campaign_id])
  end

  def user
    @user ||= User.find(params[:id])
  end
end
