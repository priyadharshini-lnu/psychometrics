# OCI Speech Transcription Integration Guide

## Overview

This guide explains how to set up OCI Speech transcription in the project, how to create and schedule transcription jobs, and how to debug or check the status of jobs.

---

## 1. Setup

### Prerequisites

- OCI account with Speech and Notification services enabled.
- OCI API keys and compartment details.
- Required gems: `oci` (add to your Gemfile if not present).

### Configuration

1. **Set up secrets and environment variables**  
   Ensure the following are set in your environment or `settings.yml`:

   - `Settings.secrets.oci.user`
   - `Settings.secrets.oci.fingerprint`
   - `Settings.secrets.oci.tenancy`
   - `Settings.secrets.oci.private_key`
   - `Settings.secrets.oci.compartment_id`
   - `Settings.secrets.oci.namespace`
   - `Settings.secrets.s3_compatible_storage.region`
   - `Settings.secrets.s3_compatible_storage.private_bucket`

2. **Additional Required Environment Variables**  
   Add the following environment variables to your `.env` file or environment configuration, as they are required for OCI transcription:

   ```env
   USE_OCI_TRANSCRIPTION='true'
   TRANSCRIPTION_MODEL='WHISPER_MEDIUM'
   TRANSCRIPTION_MODEL='ORACLE'
   TRANSCRIPTION_Language_CODE='en-US'
   ```

3. **Webhook URL**  
   The webhook for receiving OCI Speech job notifications is set up using Rails route helpers:

   ```ruby
   WEBHOOK_URL = Rails.application.routes.url_helpers.webhooks_oci_speech_transcription_url(
     host: Settings.domain,
     subdomain: Settings.subdomain,
     protocol: Settings.protocol,
     port: Settings.port
   ).freeze
   ```

4. **Notification Infrastructure**  
   Run the setup to create topics, subscriptions, and event rules for OCI Speech notifications:

   ```ruby
   OciSpeech::NotificationSetup.call!
   ```

   This will:
   - Clean up any existing notification resources with the topic.
   - Create a new topic and subscription with your webhook.
   - Set up event rules for job created, completed, and failed events.

---

## 2. Creating a Transcription Job

To start a transcription job for a `MediaResponse`, use:

```ruby
MediaResponses::Transcriptions::Oci.call!(media_response)
```

This will:
- Update the `media_response` status to `pending`.
- Build and submit a transcription job to OCI.
- Log the job ID for tracking.

---

### Scheduling a Transcription Job

To schedule a transcription job as a background job, use the `AddTranscriptionJob`:

```ruby
MediaResponses::AddTranscriptionJob.perform_later(media_response.id)
```

This will enqueue the job, which will automatically select OCI or Azure transcription based on your configuration.

---

## 3. Debugging & Monitoring Jobs

### Check Job Status

- The webhook will receive job status updates (created, completed, failed).
- You can check the status in your logs or by querying the `MediaResponse` and associated `Transcription` records.

### Manual Status Check

You can manually check the status of a transcription job using the OCI SDK.  
Use the centralized `Psy::Oci.config` for configuration:

```ruby
client = OCI::AiSpeech::AIServiceSpeechClient.new(config: Psy::Oci.config)
job = client.get_transcription_job(job_id)
puts job.data.lifecycle_state
```

Replace `job_id` with your actual transcription job ID.

### Logs

- All setup and job actions are logged using `Rails.logger`.
- Errors are logged and will update the `media_response` status to `failed`.

---

## 4. Troubleshooting

- **Network/Timeout errors:** These are handled and logged. Retry if necessary.
- **Configuration errors:** Ensure all required secrets and settings are present and valid.
- **Webhook not triggered:** Check that the webhook URL is correct and accessible from OCI.

---

## 5. References

- [OCI Speech Service Documentation](https://docs.oracle.com/en-us/iaas/Content/ai-speech/home.htm)
- [OCI Ruby SDK](https://github.com/oracle/oci-ruby-sdk)
- [Notification Setup Code](app/core/oci_speech/notification_setup.rb)
- [Transcription Job Code](app/core/media_responses/transcriptions/oci.rb)

---

## 6. Quick Start

```ruby
# Setup notification infrastructure (run once)
OciSpeech::NotificationSetup.call!

# Start a transcription job
MediaResponses::Transcriptions::Oci.call!(media_response)

# Or schedule as a background job
MediaResponses::AddTranscriptionJob.perform_later(media_response.id)
```

---

**For any issues, check the logs and ensure all OCI credentials and settings are correct.**