# frozen_string_literal: true

module Middlewares
  class CheckSession
    def initialize(app)
      @app = app
    end

    def call(env)
      @request = ActionDispatch::Request.new(env)

      return @app.call(env) unless should_use?

      id = @request.params['user_assessment_id']
      session_id = @request.params['evaluation_session_id']

      unless id && session_id
        return [401, { 'Content-Type' => 'application/json' }, [{ error: 'Unauthorized' }.to_json]]
      end

      sql = <<-SQL.squish
        SELECT id, evaluation_session_id = :session_id AS evaluation_session_exists
        FROM user_assessments
        WHERE user_assessments.id = :id
      SQL

      ua = ActiveRecord::Base.connection.execute(
        ApplicationRecord.sanitize_sql([sql, { id: id, session_id: session_id }])
      ).first

      return [401, { 'Content-Type' => 'application/json' }, [{ error: 'Unauthorized' }.to_json]] unless ua

      [
        200,
        { 'Content-Type' => 'application/json' },
        [{ evaluation_session_existis: ua['evaluation_session_exists'] }.to_json]
      ]
    end

    def should_use?
      @request.path =~ %r{^/evaluation_session_exists}
    end
  end
end
