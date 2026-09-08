# frozen_string_literal: true

module Assessors
  class ParticipantsQuery
    private_attr_reader :assessor_user, :filters

    STATUS_FILTERS = %w[evaluation_status_in moderation_status_in].freeze

    def initialize(assessor_user, filters = {})
      @assessor_user = assessor_user
      @filters = filters.respond_to?(:to_unsafe_h) ? filters.to_unsafe_h : filters.to_h
    end

    def pairs
      return Kaminari.paginate_array(status_filtered_pairs) if status_filters?

      filtered_pairs
    end

    def total
      return status_filtered_pairs.count if status_filters?

      base = filtered_pairs.except(:order).
             reselect('DISTINCT user_assessments.campaign_id, user_assessments.subject_id')
      UserAssessment.unscoped.from(base, :ua).count
    end

    def filter_options
      {
        campaigns: filtered_pairs.except(:order).
          reselect('DISTINCT user_assessments.campaign_id AS id, campaigns.name AS name').
          order('campaigns.name ASC').
          map { |campaign| { id: campaign.id, name: campaign.name } }
      }
    end

    private

    def filtered_pairs
      @filtered_pairs ||= apply_filters(pairs_query)
    end

    def pairs_query
      base_query.
        joins(:campaign, :subject).
        select(
          'DISTINCT ON (user_assessments.campaign_id, user_assessments.subject_id) ' \
          'user_assessments.campaign_id, ' \
          'user_assessments.subject_id, ' \
          'campaigns.name AS campaign_name, ' \
          'campaigns.project_id AS campaign_project_id, ' \
          'users.first_name AS candidate_first_name, ' \
          'users.last_name AS candidate_last_name, ' \
          'users.email AS candidate_email'
        ).
        order('user_assessments.campaign_id DESC, user_assessments.subject_id')
    end

    def apply_filters(query)
      query = filter_by_candidate(query)
      filter_by_campaign(query)
    end

    def filter_by_candidate(query)
      search = filter_value('candidate_cont')
      return query if search.blank?

      query.where(
        'users.first_name ILIKE :search OR users.last_name ILIKE :search OR users.email ILIKE :search OR ' \
        "CONCAT(users.first_name, ' ', users.last_name) ILIKE :search",
        search: "%#{search}%"
      )
    end

    def filter_by_campaign(query)
      campaign_ids = filter_values('campaign_id_in')
      return query if campaign_ids.blank?

      query.where(user_assessments: { campaign_id: campaign_ids })
    end

    def status_filtered_pairs
      @status_filtered_pairs ||= begin
        pairs = filtered_pairs.to_a
        campaign_ids = pairs.map(&:campaign_id).uniq
        subject_ids = pairs.map(&:subject_id).uniq

        evaluation_counts = Assessors::BulkSubjectEvaluationsCount.call!(subject_ids, assessor_user, campaign_ids)
        moderation_counts = Assessors::BulkSubjectEvaluationsCount.call!(
          subject_ids, assessor_user, campaign_ids, assessment_category: :lead_assessor_form
        )

        pairs.select do |pair|
          status_matches?(pair, evaluation_counts, 'evaluation_status_in') &&
            status_matches?(pair, moderation_counts, 'moderation_status_in')
        end
      end
    end

    def status_matches?(pair, counts_by_campaign, filter_key)
      allowed_statuses = filter_values(filter_key)
      return true if allowed_statuses.blank?

      counts = counts_by_campaign.dig(pair.campaign_id, pair.subject_id) || default_counts
      allowed_statuses.include?(Assessors::GetStatusFromCounts.call!(counts).to_s)
    end

    def status_filters?
      STATUS_FILTERS.any? { |key| filter_values(key).present? }
    end

    def filter_value(key)
      Array(filters[key]).first
    end

    def filter_values(key)
      Array(filters[key]).compact_blank
    end

    def default_counts
      UserAssessment.statuses_count.merge(total: 0)
    end

    def base_query
      UserAssessment.
        joins(:assessment).
        where(
          evaluator: assessor_user,
          relationship: Relationship.assessor_relationship,
          assessments: { category: :assessor_form }
        )
    end
  end
end
