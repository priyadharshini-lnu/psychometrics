# frozen_string_literal: true

module Administration
  class TagsSearch
    RESULTS_LIMIT = 25

    class InvalidQueryError < StandardError; end

    def initialize(scope, search_params, all: false)
      @scope = scope
      @search_params = search_params || {}
      @all = all
    end

    def call
      search_tags
    end

    private

    def search_tags
      # First, find matching skills
      matching_skills = search_skills.empty? ? @scope : search_skills

      # Then search for tags on those skills
      tag_conditions = { taggings_taggable_id_in: matching_skills.pluck(:id) }
      tag_conditions[:name_cont] = @search_params[:name_cont] if @search_params[:name_cont].present?

      ActsAsTaggableOn::Tag.joins(:taggings).
        where(taggings: { taggable_type: 'Skill' }).
        ransack(tag_conditions).
        result.
        limit(RESULTS_LIMIT)
    end

    def search_skills
      skill_conditions = @search_params.except(:all, :name_cont)

      # Handle project filtering
      if !@all && skill_conditions[:project_id_eq].nil?
        skill_conditions[:global] = true
      end

      @scope.ransack(skill_conditions).result
    end
  end
end
