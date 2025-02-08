# frozen_string_literal: true

class Api::V2::Administration::Projects::IdpTemplateResource < Api::V2::Administration::BaseResource
  attributes :name, :description, :self_rating_enabled,
             :technical_client_skill_settings, :technical_global_skill_settings,
             :behavioral_client_skill_settings, :behavioral_global_skill_settings,
             :behavioural_global_tags, :behavioural_client_tags,
             :technical_global_tags, :technical_client_tags

  has_one :project, class_name: 'Client'
  has_one :report
  has_many :idp_template_skills
  has_many :skills, through: :idp_template_skills, class_name: 'Skill'
  ransack_filters %i[name_cont id_eq]

  def self.records(opts = {})
    Api::Administration::IdpTemplatePolicy::Scope.new(
      opts[:context][:user],
      IdpTemplate,
      project_id: opts[:context][:params]['project_id'],
      client_id: opts[:context][:params]['client_id']
    ).resolve
  end
end
