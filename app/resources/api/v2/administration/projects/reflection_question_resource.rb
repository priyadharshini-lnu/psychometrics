# frozen_string_literal: true

class Api::V2::Administration::Projects::ReflectionQuestionResource < Api::V2::Administration::BaseResource
  attributes :question, :mandatory, :min_words, :max_words, :updated_at, :allow_delete
  has_one :project, class_name: 'Client'

  def allow_delete
    @model.idp_template_reflection_questions.empty?
  end

  def updated_at
    BaseDecorator.decorate(@model).updated_at
  end

  def meta_details
    {
      permissions: lambda {
        GetPermissionsHash.call!(
          Api::Administration::ReflectionQuestionPolicy,
          context[:user],
          @model,
          [%w[edit update], %w[remove destroy]],
          { project_id: @model.project_id }
        )
      }
    }
  end

  def self.records(opts)
    Api::Administration::ReflectionQuestionPolicy::Scope.new(
      opts[:context][:user],
      ReflectionQuestion,
      project_id: opts[:context][:params]['project_id']
    ).resolve
  end

  ransack_filters %i[project_id_eq question_cont]
end
