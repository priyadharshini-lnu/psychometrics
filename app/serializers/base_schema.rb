# frozen_string_literal: true

class BaseSchema
  module ClassMethods
    def schema(response, serializer)
      return super if whitelisted_schemas.include?(self)

      existing_schema = super

      unless existing_schema.config.validate_keys
        raise PankoOverride::Exceptions::KeyValidationMissing,
              "Schema class '#{name}' does not have 'config.validate_keys' set to true. Please set it to true or whitelist the schema in whitelisted_schemas method" # rubocop:disable Layout/LineLength
      end
      existing_schema
    end
  end

  def self.inherited(subclass)
    subclass.class_eval do
      class << self
        prepend ClassMethods
      end
    end
  end

  def self.validate_schema!(response, serializer)
    schema(response, serializer).call(response)
  end

  def self.schema(response, serializer)
    raise NotImplementedError, 'define schema in subclass'
  end

  def self.whitelisted_schemas
    [UsersResultSchema, ::Api::V1::ResultSchema, ::Administration::DetailsDatasheetRowSchema, AuditLogSchema,
     ActiveRecordAuditSchema, EndUser::CurrentUserSchema, AssessorScoresSchema, AdminJobRecordSchema,
     AssessmentSchema, QuestionSchema, BlockSchema, HighlightSchema,
     Reports::FilterSchema, Reports::CampaignFactorSchema, Reports::AssessmentSchema, Reports::PageSchema,
     Reports::ModuleSchema, ReportSchema, UserDashboardSchema, UsersResults::AgileSchema,
     Threesixty::EndUser::CampaignNomineeSchema, Threesixty::CampaignOptionsSchema, Threesixty::UserReportSchema,
     Threesixty::EndUser::CampaignSchema, Reports::ResultSchema, UserReportSchema,
     Administration::IndividualDashboardSchema,
     Assessments::Actions::Block::CreateByTemplate::QuestionSchema,
     Assessments::Actions::Block::CreateByTemplate::BlockSchema,
     Assessments::Actions::Question::CreateByTemplate::QuestionSchema,
     Assessments::QuestionSchema, Assessments::AssessmentSchema, Assessments::BlockSchema, Assessments::FactorSchema,
     UsersResultUpdateSchema, ProfileFieldSchema, FactorSchema, UserReportEventSchema, AuditLogInfoSchema,
     Threesixty::NominationSchema, ::Api::V1::UserCampaignSchema, ::Api::V1::UserSchema,
     UserSkillGapReportSchema]
  end
end
