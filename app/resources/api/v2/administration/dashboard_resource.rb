# frozen_string_literal: true

class Api::V2::Administration::DashboardResource < Api::V2::Administration::BaseResource
  attributes :name, :enabled, :dataset_id, :report_id, :embed_token, :image_url, :image_name, :refresh_interval,
             :capacity_id, :workspace_id, :dashboard_type, :project_path

  has_one :campaign

  ransack_filters %i[campaign_id_eq preview_available]

  after_create :create_workspace_and_attach_capacity

  delegate :workspace_id, to: :power_bi_setting, allow_nil: true

  audit_log_for :create, payload: '*'
  audit_log_for :update, payload: '*'

  def self.records(options = {})
    super(options).includes(:project)
  end

  def fetchable_fields
    return super if context[:embed_token]

    super - [:embed_token]
  end

  def embed_token
    if @model.powerbi?
      PowerBi::GetEmbedToken.call!(dataset_id, report_id, { username: context[:user].email })
    end
  end

  def capacity_id
    @capacity_id || power_bi_setting&.capacity_id
  end

  attr_writer :capacity_id

  def image_url
    @model.image&.url
  end

  def image_name
    @model.read_attribute(:image)
  end

  private

  def power_bi_setting
    @model.project.power_bi_setting
  end

  def create_workspace_and_attach_capacity
    return if @model.project.power_bi_setting

    ::PowerBi::CreateGroupAndAttachCapacityJob.perform_later(@model.project, capacity_id)
  end
end
