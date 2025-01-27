# frozen_string_literal: true

class Api::V2::Administration::Projects::IdpTemplateResource < Api::V2::Administration::BaseResource
  attributes :name, :description, :self_rating_enabled,
             :behavioural_global_tags, :behavioural_client_tags,
             :technical_global_tags, :technical_client_tags, :skills

  has_one :project, class_name: 'Client'
  has_one :report
  has_many :idp_template_skills
  ransack_filters %i[name_cont id_eq]

  def self.records(opts = {})
    Api::Administration::IdpTemplatePolicy::Scope.new(
      opts[:context][:user],
      IdpTemplate,
      project_id: opts[:context][:params]['project_id'],
      client_id: opts[:context][:params]['client_id']
    ).resolve
  end

  def skills
    @model.skills.pluck(:id)
  end

  def skills=(new_skills)
    @model.skills.clear
    new_skills.each do |skill_id|
      skill = Skill.find(skill_id)
      @model.skills << skill unless @model.skills.include?(skill)
    end
  end
end
