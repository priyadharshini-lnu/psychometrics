# frozen_string_literal: true

module Administration
  module Assessments
    class BuildersController < Administration::BaseController
      skip_before_action :enforce_geo_restriction
      before_action :set_assessment, except: %i[upload_campaign_factors]
      append_before_action :pundit_authorize

      def show
        render json: ::Assessments::AssessmentSerializer.new(
          context: {
            locale: params[:assessment_lang] || @assessment.default_language
          }
        ).serialize(@assessment)
      end

      def update
        builder = ::Builders::AssessmentBuilder.new(@assessment, params.require(:builder), current_user)
        if builder.save
          audit! :update, builder.assessment, payload: params.require(:builder)
          render json: { data: ::Assessments::AssessmentSerializer.new(
            context: {
              locale: builder.selected_locale
            }
          ).serialize(@assessment) }
        else
          render json: { error: true, errors: builder.errors }, status: :unprocessable_entity
        end
      end

      def norms
        render json: @assessment.norms.map { |norm| NormSerializer.new.serialize(norm) }
      end

      def block_templates
        blocks = ::Block.where('name ILIKE ?', "%#{params[:q]}%").
                 where(view: :templates).
                 where(owner_id: [params[:owner_id], nil]).
                 limit(10)
        render json: blocks.map { |block| { value: block.id, label: block.name } }
      end

      def question_templates
        questions = ::Question.where('name ILIKE ?', "%#{params[:q]}%").
                    where(view: :templates).
                    limit(10)
        render json: questions.map { |question| { value: question.id, label: question.name } }
      end

      def geo
        column = params[:column].to_s
        return render(json: []) unless ::Datas::Geo::FIELDS.include?(column)

        rows = ::Datas::Geo.
               select(column).
               where("#{::Datas::Geo.connection.quote_column_name(column)} ILIKE ?", "#{params[:q]}%").
               group(column).
               limit(10)
        render json: rows.map { |geo| { value: geo.value(column), label: geo.value(column) } }
      end

      def block_template
        template = ::Block.templates.find(params[:template_id])
        render json: ::Assessments::Actions::Block::CreateByTemplate::BlockSerializer.new(
          context: { include: '**' }
        ).serialize(template)
      end

      def question_template
        template = ::Question.templates.find(params[:template_id])
        render json: ::Assessments::Actions::Question::CreateByTemplate::QuestionSerializer.new(
          context: { include: '**' }
        ).serialize(template)
      end

      def upload_campaign_factors
        form = ::Administration::CampaignFactors::ImportForm.new(
          file: params[:file],
          resource_id: params[:assessment_id],
          resource_class: 'Assessment'
        )

        if form.valid?
          render json: form.processed_data, status: :ok
        else
          render json: { errors: form.errors.messages.values.flatten }, status: :unprocessable_entity
        end
      end

      private

      def set_assessment
        @assessment = policy_scope(::Assessment).find(params[:assessment_id])
      end

      # Authorisation user
      def pundit_authorize
        authorize %i[assessments builder]
      end
    end
  end
end
