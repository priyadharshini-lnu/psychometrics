# frozen_string_literal: true

require 'rails_helper'

describe ActiveStorage::Attachment do
  let(:tenant_a) { create(:tenancy) }
  let(:project_a) { create(:project, parent: tenant_a) }
  let(:campaign_a) { create(:campaign, project: project_a) }

  describe 'Tenantable' do
    it 'includes Tenantable' do
      expect(described_class.ancestors).to include(Tenantable)
    end

    it 'declares tenant_source :record' do
      expect(described_class.tenant_source_association).to eq([:record])
    end

    context 'when attached to a tenant-scoped record' do
      it 'inherits tenant_id from the record' do
        user_report = create(:user_report, campaign: campaign_a)
        blob = ActiveStorage::Blob.create_and_upload!(
          io: StringIO.new('pdf content'),
          filename: 'report.pdf',
          content_type: 'application/pdf'
        )
        attachment = ActiveStorage::Attachment.create!(
          name: 'pdf_file',
          record: user_report,
          blob: blob
        )

        expect(attachment.tenant_id).to eq(tenant_a.id)
      end
    end

    context 'when attached to a record without a tenant (e.g. a global User)' do
      it 'leaves tenant_id nil' do
        global_user = create(:user)
        blob = ActiveStorage::Blob.create_and_upload!(
          io: StringIO.new('document content'),
          filename: 'doc.pdf',
          content_type: 'application/pdf'
        )
        attachment = ActiveStorage::Attachment.create!(
          name: 'pdf_file',
          record: global_user,
          blob: blob
        )

        expect(attachment.tenant_id).to be_nil
      end
    end
  end

  describe 'AttachmentAIAssistanceExtensions' do
    it 'still has the ai_assisted_user_document_summary association' do
      expect(described_class.reflect_on_association(:ai_assisted_user_document_summary)).not_to be_nil
    end
  end
end
