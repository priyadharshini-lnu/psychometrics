# frozen_string_literal: true

class Api::V2::Administration::QuestionResource < Api::V2::Administration::BaseResource
  attributes :type, :name, :props, :position, :validation, :required_validation,
             :display_logic, :skip_logic, :template_id, :save_as_template, :disabled,
             :created_at, :updated_at

  has_one :owner
  has_one :block
  has_one :template, class_name: 'Question'
  has_one :created_by, class_name: 'User'
  has_one :updated_by, class_name: 'User'
  has_many :linked_assessments

  ransack_filters %i[assessment_id_eq type_in filterable_fields name_cont owner_id_eq view_eq]

  def self.records(opts = {})
    super.includes(
      owner: { client_design_setting: { logo_attachment: :blob } },
      linked_assessments: [:translations, :created_by, :updated_by,
                           { icon_attachment: :blob }, { poster_attachment: :blob }]
    )
  end

  before_create do
    @model.created_by_id = context[:user].id if context[:user]
    @model.updated_by_id = context[:user].id if context[:user]
    @model.view = :templates if context.dig(:params, :filter, :view_eq) == 'templates'
  end

  before_update do
    @model.updated_by_id = context[:user].id if context[:user]
  end

  audit_log_for :create, payload: '*'
  audit_log_for :update, payload: '*'
  audit_log_for :destroy, payload: ->(_, question) { question.attributes.slice('id', 'name') }
end
