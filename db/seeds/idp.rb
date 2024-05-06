# frozen_string_literal: true

require 'faker'

# CAMPAIGN_ID=10592 bundle exec rails db:seed:idp

campaign_id = ENV.fetch('CAMPAIGN_ID', nil)

ApplicationRecord.transaction do
  campaign = Campaign.find(campaign_id)
  project = campaign.project
  client = project.parent
  skill_1_score = Faker::Code.asin
  skill_2_score = Faker::Code.asin
  skill_3_score = Faker::Code.asin
  skill_4_score = Faker::Code.asin
  development_action1 = DevelopmentAction.create!(name: 'Development Action 1',
                                                  description: 'Development Action 1 Description')
  development_action2 = DevelopmentAction.create!(
    owner: client,
    name: 'Development Action 2',
    description: 'Development Action 2 Description',
    category: :online_course,
    course_provider: 'Coursera',
    course_url: 'https://www.coursera.org/professional-certificates/ibm-data-analyst'
  )
  development_action3 = DevelopmentAction.create!(name: 'Development Action 3',
  description: 'Development Action 3 Description')
  development_action4 = DevelopmentAction.create!(
    owner: client,
    name: 'Development Action 4',
    description: 'Development Action 4 Description',
    category: :online_course,
    course_provider: 'Coursera',
    course_url: 'https://www.coursera.org/professional-certificates/ibm-data-analyst'
  )

  campaign_factor_group = campaign.campaign_factor_groups.create!(name: 'Group 1', position: 1)
  campaign_factor1 = campaign.campaign_factors.create!(
    campaign_factor_group: campaign_factor_group,
    name: 'Skill1 Factor',
    code: skill_1_score,
    factor_type: 'formula',
    output_type: 'numeric',
    formula: 'return 2'
  )
  campaign_factor1 = campaign.campaign_factors.create!(
    campaign_factor_group: campaign_factor_group,
    name: 'Skill2 Factor',
    code: skill_2_score,
    factor_type: 'formula',
    output_type: 'numeric',
    formula: 'return 4'
  )
  campaign_factor3 = campaign.campaign_factors.create!(
    campaign_factor_group: campaign_factor_group,
    name: 'Skill3 Factor',
    code: skill_3_score,
    factor_type: 'formula',
    output_type: 'numeric',
    formula: 'return 2'
  )
  campaign_factor4 = campaign.campaign_factors.create!(
    campaign_factor_group: campaign_factor_group,
    name: 'Skill4 Factor',
    code: skill_4_score,
    factor_type: 'formula',
    output_type: 'numeric',
    formula: 'return 4'
  )

  skill1 = Skill.create!(name: "Skill #{Faker::Lorem.characters(number: 5)}", description: 'Skill 1 Description')
  skill2 = Skill.create!(name: "Skill #{Faker::Lorem.characters(number: 5)}", description: 'Skill 2 Description')
  skill1.job_roles.create!(name: "Job Role  #{Faker::Lorem.characters(number: 5)}",
                           description: 'Job Role 1 Description')

  idp_template = client.idp_templates.create!(
    name: Faker::Lorem.characters(number: 8),
    description: 'IDP Template 1 Description',
    available_skills_selection_type: :selected,
    available_development_actions_selection_type: :selected,
    suggested_development_actions_selection_type: :all,
    skill_gap_datasheet_columns: ['Job Title', 'Department', 'Location'],
    skill_gap_profile_field_names: ['First Name', 'Last Name']
  )
  idp_template.idp_template_skills.create!(
    skill: skill1,
    category: :required,
    scoring_source: :campaign_factor,
    campaign_factor_code: skill_1_score,
    desired_rating: 4.5,
    min_rating: 0,
    max_rating: 5
  )
  idp_template.idp_template_skills.create!(
    skill: skill2,
    category: :required,
    scoring_source: :campaign_factor,
    campaign_factor_code: skill_2_score,
    desired_rating: 3,
    min_rating: 0,
    max_rating: 5
  )
  idp_template.idp_template_development_actions.create!(
    development_action: development_action1,
    category: :suggested
  )
  idp_template.idp_template_development_actions.create!(
    development_action: development_action2,
    category: :suggested
  )
  idp_template.idp_template_development_actions.create!(
    development_action: development_action3,
    category: :suggested
  )
  idp_template.idp_template_development_actions.create!(
    development_action: development_action4,
    category: :suggested
  )
  campaign.update!(default_idp_template: idp_template)
  subject_user = Users::Regular.create!(
    first_name: Faker::Name.first_name,
    last_name: Faker::Name.last_name,
    email: Faker::Internet.email,
    password: 'Random@password1',
    project: project
  )
  puts "Created subject email: #{subject_user.email}, password: Random@password1"

  CampaignUser.create!(campaign: campaign, user: subject_user)

  user_idp_plan = subject_user.create_active_user_idp_plan(
    idp_template: idp_template, status: :approved, campaign: campaign
  )
  user_idp_skill1 = user_idp_plan.user_idp_skills.create!(skill: skill1, initial_rating: 2)
  user_idp_skill2 = user_idp_plan.user_idp_skills.create!(skill: skill2, initial_rating: 3)
  user_idp_skill1.user_idp_development_actions.create!(
    user_idp_plan: user_idp_plan, development_action: development_action1
  )
  user_idp_skill2.user_idp_development_actions.create!(
    user_idp_plan: user_idp_plan,
    development_action: development_action2,
    start_date_time: 1.day.ago,
    end_date_time: 2.days.from_now
  )
end
