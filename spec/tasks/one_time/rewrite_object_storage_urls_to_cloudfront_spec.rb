# frozen_string_literal: true

require 'rails_helper'

describe 'one_time:rewrite_object_storage_urls_to_cloudfront' do
  include Rake::DSL

  let(:rake_task) { Rake::Task['one_time:rewrite_object_storage_urls_to_cloudfront'] }
  let(:public_url) { 'https://psychometrics-prod.s3.eu-west-1.amazonaws.com/public/library/file/test-image.png' }
  let(:old_public_prefix) { 'https://psychometrics-prod.s3.eu-west-1.amazonaws.com/public/' }
  let(:private_url) do
    'https://psychometrics-prod.s3.eu-west-1.amazonaws.com/private/admin_job/4567/file/test-export.csv?X-Amz-Signature=abc123'
  end
  let(:one_day_expiry_url) do
    'https://psychometrics-prod.s3.eu-west-1.amazonaws.com/one_day_expiry_folder/reports/file.pdf?X-Amz-Signature=zzz'
  end
  let(:cdn_public_url) { 'https://s3.tte-lighthouse.com/public/library/file/test-image.png' }
  let(:report) { create(:report) }

  before do
    Rake.application.rake_require 'tasks/one_time/rewrite_object_storage_urls_to_cloudfront'
    Rake::Task.define_task(:environment)
  end

  after do
    rake_task.reenable
  end

  describe 'task behavior' do
    let!(:question) do
      create(:question, props: { 'questionText' => "Public #{public_url} and private #{private_url}" })
    end
    let!(:block) do
      create(:block, assessment: question.assessment, props: { 'staticContent' => { 'value' => public_url } })
    end
    let!(:page) do
      create(:page, report: report, props: { 'heroImage' => one_day_expiry_url },
display_logic: { 'url' => public_url })
    end
    let!(:report_module) do
      create(:module,
             page: page,
             assessment: report.assessments.first,
             props: { 'body' => "<img src=\"#{public_url}\">" },
             meta: { 'downloads' => [private_url] })
    end
    let!(:translation) do
      create(:translation,
             translateable: question,
             resource: question.assessment,
             props: { 'label' => public_url },
             data: { 'props' => { 'label' => private_url } })
    end

    context 'dry run mode' do
      it 'does not modify any records' do
        expect do
          rake_task.invoke(true, 1000, old_public_prefix, 'https://s3.tte-lighthouse.com/public/')
        end.not_to(change do
                     [question.reload.props, block.reload.props, page.reload.props, report_module.reload.props,
                      translation.reload.props, translation.reload.data]
                   end)
      end
    end

    context 'real run mode' do
      it 'rewrites public URLs and leaves private URLs unchanged' do
        rake_task.invoke(false, 1000, old_public_prefix, 'https://s3.tte-lighthouse.com/public/')

        expect(question.reload.props).to eq(
          'questionText' => "Public #{cdn_public_url} and private #{private_url}"
        )
        expect(block.reload.props).to eq('staticContent' => { 'value' => cdn_public_url })
        expect(page.reload.props).to eq('heroImage' => one_day_expiry_url)
        expect(page.reload.display_logic).to eq('url' => cdn_public_url)
        expect(report_module.reload.props).to eq('body' => "<img src=\"#{cdn_public_url}\">")
        expect(report_module.reload.meta).to eq('downloads' => [private_url])
        expect(translation.reload.props).to eq('label' => cdn_public_url)
        expect(translation.reload.data).to eq('props' => { 'label' => private_url })
      end
    end

    context 'parameter parsing' do
      it 'accepts dry_run as true' do
        expect do
          rake_task.invoke(true, 1000, old_public_prefix, 'https://s3.tte-lighthouse.com/public/')
        end.not_to raise_error
      end

      it 'defaults batch_size to 1000 when zero' do
        expect do
          rake_task.invoke(true, 0, old_public_prefix, 'https://s3.tte-lighthouse.com/public/')
        end.not_to raise_error
      end

      it 'accepts custom old_url and new_url params' do
        custom_old_url = 'https://legacy.example.com/public/'
        custom_new_url = 'https://cdn.example.com/public/'
        question.update!(props: { 'questionText' => "Public #{custom_old_url}asset.png and private #{private_url}" })

        rake_task.invoke(false, 1000, custom_old_url, custom_new_url)

        expect(question.reload.props).to eq(
          'questionText' => "Public #{custom_new_url}asset.png and private #{private_url}"
        )
      end
    end

    context 'URL params validation' do
      it 'fails gracefully when old_url is blank' do
        expect { rake_task.invoke(true, 1000, '', 'https://s3.tte-lighthouse.com/public/') }.to raise_error(SystemExit)
      end

      it 'fails gracefully when new_url is blank' do
        expect { rake_task.invoke(true, 1000, old_public_prefix, '') }.to raise_error(SystemExit)
      end
    end
  end
end
