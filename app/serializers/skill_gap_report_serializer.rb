# frozen_string_literal: true

class SkillGapReportSerializer < Panko::Serializer
  attributes :id, :datasheet_fields, :profile_fields, :idp_template_skills

  delegate :user_idp_plan, to: :object

  def datasheet_fields
    user_idp_plan.idp_template.skill_gap_datasheet_columns # datsheet data
    data = campaign.datasheet_data(object.email)
    data.slice(*user_idp_plan.idp_template.skill_gap_datasheet_columns).map do |field, value|
      { field: field, value: value }
    end
  end

  def profile_fields
    user_idp_plan.idp_template.skill_gap_profile_field_names.filter_map do |field|
      if object.respond_to?(field)
        next {
          field: field,
          value: object.send(field)
        }
      end
      if object.user_profile.respond_to?(field)
        next {
          field: field,
          value: object.user_profile.send(field)
        }
      end
    end
  end

  def idp_template_skills
    skill_templates = user_idp_plan.idp_template.idp_template_skills.where(category: :required)
    codes = skill_templates.pluck(:campaign_factor_code)

    score_source = skill_templates.where(scoring_source: :assessment).
                   select(:assessment_id, :factor_id, :assessment_score_type)

    campaign_factor_values = CampaignUsers::GetCampaignScore.call!(campaign, object, codes)
    user_assessment_scores = CampaignUsers::GetAssessmentScore.call!(
      campaign, object, score_source
    )

    Panko::ArraySerializer.new(
      skill_templates.includes(:skill),
      each_serializer: EndUser::IdpTemplateSkillSerializer,
      context: {
        campaign: campaign, user: object, user_scorings: user_scorings,
        campaign_factor_values: campaign_factor_values.transform_keys(&:code),
        user_assessment_scores: user_assessment_scores
      }
    )
  end

  private

  def user_scorings
    context[:user_scorings]
  end

  def campaign
    context[:campaign]
  end
end
