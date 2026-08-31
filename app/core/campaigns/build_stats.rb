# frozen_string_literal: true

module Campaigns
  class BuildStats < BaseCommand
    private_attr_reader :campaign, :campaign_users_active_in, :datasheet_filters

    def initialize(campaign, campaign_users_active_in, datasheet_filters = {})
      @campaign = campaign
      @campaign_users_active_in = campaign_users_active_in
      @datasheet_filters = datasheet_filters
      @datasheet_rows = []

      if @datasheet_filters.present?
        @datasheet_rows = campaign.project_datasheet.rows.map do |r|
          SheetRows::GetData.call!(r).except(:id)
        end
      end
    end

    def call
      broadcast(:ok, {
        users: build_users,
        assessments: build_assessments
      })
    end

    private

    def build_users
      campaign_users = CampaignUser.joins(:user).
                       where(campaign_id: campaign.id, active: campaign_users_active_in, users: { is_uat: false }).
                       select('campaign_users.id, campaign_users.status, users.email')

      filtered_users = campaign_users.select { |cu| campaign_user_passes_datasheet_filter?(cu) }

      status_counts = filtered_users.group_by(&:status).transform_values(&:count)
      result = { 'total' => filtered_users.count }
      status_counts.each do |status, count|
        result[status] = count
      end
      result
    end

    def build_assessments
      campaign_users = CampaignUser.joins(:user).
                       where(campaign_id: campaign.id, active: campaign_users_active_in, users: { is_uat: false }).
                       select('campaign_users.id, campaign_users.status, users.email')
      filtered_user_ids = campaign_users.select { |cu| campaign_user_passes_datasheet_filter?(cu) }.map(&:id)

      query = UserAssessment.joins(:campaign_user).select(
        :assessment_id, :status, 'count(DISTINCT user_assessments.id) as status_count'
      ).group(:assessment_id, :status).
              where(campaign_id: campaign.id, campaign_users: { id: filtered_user_ids }).to_sql
      user_assessments_count_by_status = ActiveRecord::Base.connection.execute(query).to_a.index_by do |us|
        [us['assessment_id'], UserAssessment.statuses.key(us['status'])]
      end

      statuses = UserAssessment.statuses.keys
      campaign.campaign_users.where(id: filtered_user_ids).
        includes(assessments: :campaign_assessments).
        where(campaign_assessments: { campaign_id: campaign.id }).flat_map(&:assessments).uniq.map do |a|
        statuses.each_with_object({ 'id' => a.id, 'name' => a.name }) do |status, result|
          result[status] = user_assessments_count_by_status[[a.id, status]]&.try(:[], 'status_count') || 0
        end
      end
    end

    def get_datasheet_row_for_user(campaign_user_data)
      @datasheet_rows.find do |row|
        %w[Email email].any? { |key| row[key].to_s.strip.casecmp?(campaign_user_data.email.to_s.strip) }
      end
    end

    def campaign_user_passes_datasheet_filter?(filtered_campaign_user)
      return true if @datasheet_filters.blank?

      user_datasheet_row = get_datasheet_row_for_user(filtered_campaign_user)
      user_datasheet_row = {} if user_datasheet_row.blank?

      @datasheet_filters.each do |field, valid_options|
        row_value = user_datasheet_row[field.to_s]
        return false if valid_options.exclude?(row_value)
      end
      true
    end
  end
end
