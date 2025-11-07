# frozen_string_literal: true

module EndUser
  class UserIdpCommentsController < ApplicationController
    append_before_action :pundit_authorize, except: [:update]
    before_action :load_user_idp_plan!
    before_action :load_comment, only: %i[resolve unresolve update]
    after_action :mark_as_read, only: %i[index show]

    def index
      comments = @user_idp_plan.user_idp_comments.top_level
      load_replies = params[:load_replies] == 'true'

      filtered_comments = Idp::CommentFilterService.call!(comments, params, current_user)

      paginated_comments = filtered_comments.page(params[:page]).per(params[:page_size] || 25)

      @loaded_comments = paginated_comments

      render json: {
        data: Panko::ArraySerializer.new(
          paginated_comments,
          each_serializer: EndUser::UserIdpCommentSerializer,
          context: { current_user: current_user, load_replies: load_replies }
        ).to_a,
        meta: {
          count: filtered_comments.count
        }
      }, status: :ok
    end

    def show
      comment = @user_idp_plan.user_idp_comments.
                includes(:created_by, :resolved_by, replies: [:created_by]).
                find(params[:id])

      @loaded_comments = [comment]

      render json: {
        data: EndUser::UserIdpCommentSerializer.new(
          context: { current_user: current_user, load_replies: true }
        ).serialize(comment)
      }, status: :ok
    end

    def create
      comment = @user_idp_plan.user_idp_comments.create!(
        comments_params.merge(created_by: current_user)
      )

      render json: {
        data: EndUser::UserIdpCommentSerializer.new(
          context: { current_user: current_user }
        ).serialize(comment)
      }, status: :created
    end

    def resolve
      @comment.resolve!(current_user)

      render json: {
        data: EndUser::UserIdpCommentSerializer.new(
          context: { current_user: current_user }
        ).serialize(@comment)
      }, status: :ok
    end

    def unresolve
      @comment.unresolve!

      render json: {
        data: EndUser::UserIdpCommentSerializer.new(
          context: { current_user: current_user }
        ).serialize(@comment)
      }, status: :ok
    end

    def update
      authorize(@comment, nil, policy_class: ::EndUser::UserIdpCommentsPolicy)

      @comment.update!(update_params.merge(edited: true))

      render json: {
        data: EndUser::UserIdpCommentSerializer.new(
          context: { current_user: current_user }
        ).serialize(@comment)
      }, status: :ok
    end

    private

    def mark_as_read
      comment_ids = @loaded_comments.pluck(:id)

      reply_ids = if params[:load_replies] == 'true' || action_name == 'show'
                    @loaded_comments.flat_map(&:replies).pluck(:id)
                  else
                    []
                  end

      all_loaded_comment_ids = (comment_ids + reply_ids).uniq
      return if all_loaded_comment_ids.empty?

      UserIdpComment.where(id: all_loaded_comment_ids).
        where.not('read_by_user_ids @> ARRAY[?]::integer[]', current_user.id).
        update_all(
          "read_by_user_ids = array_append(read_by_user_ids, #{current_user.id})"
        )
    end

    def user
      @user ||= params[:user_id].present? ? User.find(params[:user_id]) : current_user
    end

    def load_comment
      @comment = @user_idp_plan.user_idp_comments.find(params[:id])
    end

    def load_user_idp_plan!
      @user_idp_plan = user.active_user_idp_plan
    end

    def comments_params
      params.expect(user_idp_comment: %i[content resource_type resource_id parent_id])
    end

    def update_params
      params.expect(user_idp_comment: [:content])
    end

    def pundit_authorize
      authorize(user, nil, policy_class: ::EndUser::UserIdpCommentsPolicy)
    end
  end
end
