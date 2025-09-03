# frozen_string_literal: true

module Skills
  class GetQuestions < BaseCommand
    attr_reader :skills_config, :campaign_user

    def initialize(skills_config, campaign_user)
      @skills_config = skills_config || {}
      @campaign_user = campaign_user
    end

    def call
      return broadcast(:ok, questions: []) if campaign_user.blank?

      skill_ids = collect_skill_ids
      questions = get_latest_questions_for_skills(skill_ids)
      broadcast :ok, questions: questions
    end

    private

    def get_latest_questions_for_skills(skill_ids)
      return [] if skill_ids.blank?

      latest_ids = Question.
                   where(skill_id: skill_ids).
                   group(:skill_id).
                   maximum(:id).
                   values

      Question.includes(:skill).where(id: latest_ids)
    end

    def collect_skill_ids
      skills_config.each_with_object([]) do |(skill_type, config), skill_ids|
        next unless config['enabled']

        job_roles = Array(config['job_roles'])
        job_roles.each do |role_type|
          next unless (job_role_id = get_job_role_id(role_type))

          ids = JobRole.fetch_skills_for_types(job_role_id, [skill_type], project&.id)
          skill_ids.concat(ids)
        end
      end.uniq
    end

    def get_job_role_id(role_type)
      case role_type
        when 'current_job_role'
          campaign_user.current_job_role_id
        when 'target_job_role'
          campaign_user.target_job_role_id
      end
    end

    def project
      @project ||= campaign_user.project
    end
  end
end
