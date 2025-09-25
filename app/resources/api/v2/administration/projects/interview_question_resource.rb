# frozen_string_literal: true

class Api::V2::Administration::Projects::InterviewQuestionResource < Api::V2::Administration::BaseResource
  attributes :question, :description, :question_type, :mandatory, :time_limit, :updated_at, :allow_delete, :tag_list
  has_one :project, class_name: 'Client'

  def allow_delete
    @model.idp_template_interview_questions.empty?
  end

  def updated_at
    BaseDecorator.decorate(@model).updated_at
  end

  def self.records(opts)
    Api::Administration::InterviewQuestionPolicy::Scope.new(
      opts[:context][:user],
      InterviewQuestion,
      project_id: opts[:context][:params]['project_id']
    ).resolve
  end

  def tag_list
    @model.all_tags_list
  end

  def tag_list=(tags)
    @model.save_tag_with_ownership(tags)
  end

  ransack_filters %i[project_id_eq question_cont]
end
