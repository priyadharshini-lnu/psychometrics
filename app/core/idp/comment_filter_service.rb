# frozen_string_literal: true

module Idp
  class CommentFilterService < BaseCommand
    private_attr_reader :comments, :params, :current_user

    def initialize(comments, params, current_user)
      @comments = comments
      @params = params
      @current_user = current_user
    end

    def call
      loaded_relation = apply_includes(comments)
      filtered_comments = apply_custom_filters(loaded_relation)
      filtered_comments = apply_ransack_filters(filtered_comments)
      broadcast :ok, filtered_comments
    end

    private

    def apply_includes(relation)
      relation = relation.includes(:created_by, :resolved_by)

      if load_replies?
        relation = relation.includes(replies: [:created_by])
      end

      relation
    end

    def apply_ransack_filters(relation)
      return relation if params[:q].blank?

      relation.ransack(params[:q], auth_object: current_user).result
    end

    def load_replies?
      params[:load_replies].present? &&
        params[:load_replies].in?(['true', '1', true])
    end

    def apply_custom_filters(relation)
      if unread_filter_enabled?
        relation = relation.unread_or_unread_replies_for_user(current_user)
      end

      relation
    end

    def unread_filter_enabled?
      params[:unread_by_user].present? &&
        params[:unread_by_user].in?(['true', '1', true])
    end
  end
end
